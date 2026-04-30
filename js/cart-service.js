// ==========================================
// CART SERVICE
// Handles cart state, localStorage persistence, and Navbar UI updates globally.
// ==========================================

// Initialize state from LocalStorage or empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

/**
 * Updates the navbar cart counter globally.
 */
function updateCartUI() {
    const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.querySelector('.icon-shopping_cart');
    if (badge && badge.parentElement) {
        badge.parentElement.innerHTML = `<span class="icon-shopping_cart"></span>[${totalCount}]`;
    }
}

/**
 * Persists cart to LocalStorage.
 */
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Adds an item to the cart or increments its quantity.
 * Relies on `allProducts` array from product-service.js if adding a new product.
 */
function addToCart(productID) {
    const existingProduct = cart.find(item => item.id === productID);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        if (typeof allProducts !== 'undefined') {
            const productData = allProducts.find(p => p.id === productID);
            if (productData) {
                cart.push({ ...productData, quantity: 1 });
            }
        } else {
            console.error("allProducts is not available. Cannot add new product to cart.");
            return;
        }
    }

    saveToLocalStorage();
    updateCartUI();
}

/**
 * Removes an item from the cart entirely.
 */
function removeFromCart(id) {
    cart = cart.filter(item => item.id != id);
    saveToLocalStorage();
    
    // If we are on the Cart page, trigger a re-render
    if (typeof renderCart === 'function') {
        renderCart();
    } else {
        updateCartUI();
    }
}

/**
 * Updates the quantity of a specific item in the cart.
 */
function updateQuantity(id, newQuantity) {
    const qty = parseInt(newQuantity);
    if (qty < 1) return;

    const item = cart.find(item => item.id == id);
    if (item) {
        item.quantity = qty;
        saveToLocalStorage();
        
        // If we are on the Cart page, trigger a re-render
        if (typeof renderCart === 'function') {
            renderCart();
        } else {
            updateCartUI();
        }
    }
}

// Run immediately on page load to update the counter
document.addEventListener('DOMContentLoaded', updateCartUI);
