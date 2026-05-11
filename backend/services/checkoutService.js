const orderRepository = require('../repositories/orderRepository');

// --- DYNAMIC CONFIGURATION: Makes it easy for anyone to run the project ---
const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || `http://localhost:${PORT}/api/verify`;
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || `http://localhost:${PORT}/api/products`;
const MAX_CART_ITEMS = parseInt(process.env.MAX_CART_ITEMS) || 100;

const processCheckout = async (userId, cartItems) => {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        const error = new Error("Your cart is empty or invalid.");
        error.statusCode = 400;
        throw error;
    }

    if (!userId) {
        const error = new Error("Invalid Session");
        error.statusCode = 401;
        throw error;
    }

    // --- SECURITY: Limit cart size to prevent DoS ---
    if (cartItems.length > MAX_CART_ITEMS) {
        const error = new Error(`Cart exceeds maximum limit of ${MAX_CART_ITEMS} items.`);
        error.statusCode = 400;
        throw error;
    }

    // Validate each cart item has valid id and quantity
    for (const item of cartItems) {
        if (!Number.isInteger(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) {
            const error = new Error("Each cart item must have a valid id and quantity (positive integer).");
            error.statusCode = 400;
            throw error;
        }
    }

    // --- MICROSERVICE DECOUPLING: Verify User via User Service ---
    try {
        const userResponse = await fetch(`${USER_SERVICE_URL}/${userId}`);
        
        if (!userResponse.ok) {
            const error = new Error("Invalid Session");
            error.statusCode = 401;
            throw error;
        }
    } catch (err) {
        if(err.statusCode) throw err;
        console.error("User Validation Error:", err.message);
        const error = new Error("Checkout currently unavailable. User Service is offline.");
        error.statusCode = 503;
        throw error;
    }

    // --- MICROSERVICE DECOUPLING: Verify Prices via Bulk Catalog Fetch ---
    const verifiedCartItems = [];
    try {
        const productIds = cartItems.map(item => item.id);
        const response = await fetch(`${CATALOG_SERVICE_URL}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: productIds })
        });

        if (!response.ok) {
            throw new Error(`Catalog service responded with status: ${response.status}`);
        }

        const products = await response.json();
        const productMap = new Map(products.map(p => [p.id, p]));

        for (const item of cartItems) {
            const product = productMap.get(item.id);
            if (!product) {
                const err = new Error(`Product ${item.id} not found in catalog.`);
                err.statusCode = 400;
                throw err;
            }

            verifiedCartItems.push({
                id: item.id,
                quantity: item.quantity,
                price: product.price // Use the verified true price
            });
        }
    } catch (fetchError) {
        if (fetchError.statusCode) throw fetchError;
        console.error(`Catalog Service Bulk Error:`, fetchError.message);
        const error = new Error("Checkout currently unavailable. The Catalog Service is offline.");
        error.statusCode = 503;
        throw error;
    }

    try {
        await orderRepository.processCheckoutTransaction(userId, verifiedCartItems);
        return { status: "Success", message: "Order items saved to relational database." };
    } catch (err) {
        console.error("Relational Save Error:", err);
        const error = new Error("Checkout failed. Inventory and cart preserved.");
        error.statusCode = 500;
        throw error;
    }
};

module.exports = {
    processCheckout
};
