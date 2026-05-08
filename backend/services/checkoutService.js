const orderRepository = require('../repositories/orderRepository');

const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://catalog-service/api/products';

const processCheckout = async (userId, cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        const error = new Error("Your cart is empty.");
        error.statusCode = 400;
        throw error;
    }

    if (!userId) {
        const error = new Error("Invalid Session");
        error.statusCode = 401;
        throw error;
    }

    // --- MICROSERVICE DECOUPLING: Verify User via User Service ---
    try {
        const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service/api/verify';
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

    // --- MICROSERVICE DECOUPLING: Verify Prices via Catalog Service ---
    const verifiedCartItems = [];
    for (const item of cartItems) {
        try {
            const response = await fetch(`${CATALOG_SERVICE_URL}/${item.id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    const err = new Error(`Product ${item.id} not found in catalog.`);
                    err.statusCode = 400;
                    throw err;
                }
                throw new Error(`Catalog service responded with status: ${response.status}`);
            }
            
            const product = await response.json();
            
            verifiedCartItems.push({
                id: item.id,
                quantity: item.quantity,
                price: product.price // Use the verified true price
            });
            
        } catch (fetchError) {
            console.error(`Catalog Service Error for product ${item.id}:`, fetchError.message);
            // Handle offline/unreachable catalog service
            if (!fetchError.statusCode) {
                const error = new Error("Checkout currently unavailable. The Catalog Service is offline. Please try again later.");
                error.statusCode = 503; // Service Unavailable
                throw error;
            }
            throw fetchError;
        }
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
