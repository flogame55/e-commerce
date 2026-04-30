// ==========================================
// CART PAGE SERVICE
// Handles the dynamic rendering of the cart table and totals on cart.html.
// Relies on cart-service.js for actual cart state.
// ==========================================

function renderCart() {
    const tableBody = document.getElementById('cart-table-body');
    if (!tableBody) return; // Only runs if the cart table exists

    let html = '';
    let subtotal = 0;

    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>';
        updateTotals(0);
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <tr class="text-center">
                <td class="product-remove"><a href="#" onclick="removeFromCart('${item.id}'); return false;"><span class="ion-ios-close"></span></a></td>
                
                <td class="image-prod"><div class="img" style="background-image:url(${item.image});"></div></td>
                
                <td class="product-name">
                    <h3>${item.name}</h3>
                    <p>${item.category || ''}</p>
                </td>
                
                <td class="price">$${item.price.toFixed(2)}</td>
                
                <td class="quantity">
                    <div class="input-group mb-3">
                        <input type="number" name="quantity" class="quantity form-control input-number" value="${item.quantity}" min="1" max="100" onchange="updateQuantity('${item.id}', this.value)">
                    </div>
                </td>
                
                <td class="total">$${itemTotal.toFixed(2)}</td>
            </tr>`;
    });

    tableBody.innerHTML = html;
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const delivery = subtotal > 0 ? 5.00 : 0; // Example delivery fee
    const discount = 0; // Example discount
    const total = subtotal + delivery - discount;

    const subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    
    const deliveryEl = document.getElementById('cart-delivery');
    if (deliveryEl) deliveryEl.innerText = `$${delivery.toFixed(2)}`;
    
    const discountEl = document.getElementById('cart-discount');
    if (discountEl) discountEl.innerText = `$${discount.toFixed(2)}`;
    
    const finalTotalEl = document.getElementById('cart-final-total');
    if (finalTotalEl) finalTotalEl.innerText = `$${total.toFixed(2)}`;
}

// Auto render the cart when page loads
document.addEventListener('DOMContentLoaded', renderCart);
