// app.js - Main frontend application for ShopLite E-commerce
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Global state
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ======================
// AUTHENTICATION HELPERS
// ======================

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    cart = [];
    currentUser = null;
    updateNavigation();
    window.location.href = 'index.html';
}

// Update navigation based on auth status
function updateNavigation() {
    const { user } = checkAuth();
    
    // Update all nav elements
    const navElements = document.querySelectorAll('nav, .menu, header nav');
    
    navElements.forEach(navElement => {
        if (!navElement || !navElement.innerHTML) return;
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartText = totalItems > 0 ? ` (${totalItems})` : '';
        
        if (user) {
            // Check if it's a simple nav or menu with ul
            if (navElement.tagName === 'NAV' && !navElement.querySelector('ul')) {
                navElement.innerHTML = `
                    <a href="index.html">Home</a>
                    <a href="cart.html">Cart${cartText}</a>
                    <a href="orders.html">My Orders</a>
                    <span style="color:#666; margin:0 15px;">Welcome, ${user.name}</span>
                    <a href="#" onclick="logout()" class="logout-btn">Logout</a>
                `;
            } else {
                // Menu with UL structure
                navElement.innerHTML = `
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="cart.html">Cart${cartText}</a></li>
                        <li><a href="orders.html">My Orders</a></li>
                        <li><span style="color:#666; padding:0 15px;">Welcome, ${user.name}</span></li>
                        <li><a href="#" onclick="logout()">Logout</a></li>
                    </ul>
                `;
            }
        } else {
            if (navElement.tagName === 'NAV' && !navElement.querySelector('ul')) {
                navElement.innerHTML = `
                    <a href="index.html">Home</a>
                    <a href="cart.html">Cart${cartText}</a>
                    <a href="login.html">Login</a>
                    <a href="register.html">Register</a>
                `;
            } else {
                navElement.innerHTML = `
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="cart.html">Cart${cartText}</a></li>
                        <li><a href="login.html">Login</a></li>
                        <li><a href="register.html">Register</a></li>
                    </ul>
                `;
            }
        }
    });
}

// Show toast notification
function toast(message, type = 'info') {
    // Remove existing toast
    const existingToast = $('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'danger' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS for toast animations
if (!$('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ======================
// CART MANAGEMENT
// ======================

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update all cart count elements
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    cartCountElements.forEach(element => {
        if (element.tagName === 'SPAN') {
            element.textContent = totalItems;
        }
    });
    
    // Update cart link text if exists
    const cartLinks = document.querySelectorAll('a[href="cart.html"]');
    cartLinks.forEach(link => {
        if (totalItems > 0) {
            link.textContent = `Cart (${totalItems})`;
        } else {
            link.textContent = 'Cart';
        }
    });
}

// Add item to cart - ALLOW WITHOUT LOGIN
function addToCart(product, quantity = 1) {
    const productId = product._id || product.id;
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image || 'https://via.placeholder.com/300x200?text=No+Image',
            quantity: quantity
        });
    }
    
    saveCart();
    toast(`Added ${product.name} to cart`, 'success');
    
    // Update cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
    
    return true;
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    renderCart();
    toast('Item removed from cart', 'success');
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            renderCart();
        }
    }
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    renderCart();
    toast('Cart cleared', 'success');
}

// Calculate cart total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate and update cart totals in the summary
function updateCartSummary() {
    const subtotal = calculateTotal();
    const shipping = subtotal > 0 ? 99.00 : 0; // R99 shipping fee
    const total = subtotal + shipping;
    
    const subtotalElement = document.getElementById('cartSubtotal');
    const shippingElement = document.getElementById('shippingCost');
    const totalElement = document.getElementById('cartTotal');
    
    if (subtotalElement) subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `R${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `R${total.toFixed(2)}`;
    
    // Show/hide empty cart message
    const emptyCartMessage = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (cartItems) cartItems.style.display = 'none';
    } else {
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        if (cartItems) cartItems.style.display = 'block';
    }
}

// ======================
// RENDER FUNCTIONS
// ======================

// Render cart items
function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p class="muted">Your cart is empty</p>
                <a href="index.html" class="btn primary">Continue Shopping</a>
            </div>
        `;
        updateCartSummary();
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/100x100?text=No+Image'">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="price">R${item.price.toFixed(2)} each</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.productId}', ${item.quantity - 1})" 
                            class="btn btn-sm">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.productId}', ${item.quantity + 1})" 
                            class="btn btn-sm">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p>R${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item.productId}')" 
                        class="btn btn-sm danger">Remove</button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

// Render product list - UPDATED VERSION
function renderProducts() {
    const container = $('#products') || $('#productGrid');
    if (!container) return;
    
    console.log('renderProducts called. window.PRODUCTS:', window.PRODUCTS);
    
    // If products are already loaded, render them
    if (window.PRODUCTS && window.PRODUCTS.length > 0) {
        console.log('Products found, rendering...');
        renderProductGrid(container, window.PRODUCTS);
        updateFilterOptions(window.PRODUCTS);
        
        // Hide loading message
        const loadingElement = $('.loading-products');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Check if we need to apply URL filters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            const categorySelect = document.getElementById('categorySelect');
            if (categorySelect) {
                categorySelect.value = categoryParam;
                // Apply filters after a short delay
                setTimeout(() => {
                    if (typeof applyFilters === 'function') {
                        applyFilters();
                    }
                }, 100);
            }
        }
        
    } else {
        console.log('Products not loaded yet, showing loading...');
        // Show loading message
        container.innerHTML = `
            <div class="loading-products" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>Loading products...</p>
                <button onclick="retryLoadProducts()" class="btn">Retry</button>
            </div>
        `;
        
        // Try to load products after a short delay
        setTimeout(() => {
            if (window.PRODUCTS && window.PRODUCTS.length > 0) {
                renderProducts(); // Try again
            } else if (typeof loadProducts === 'function') {
                console.log('Calling loadProducts from data.js');
                loadProducts();
            }
        }, 500);
    }
}

// Retry loading products
function retryLoadProducts() {
    console.log('Retrying to load products...');
    if (typeof loadProducts === 'function') {
        loadProducts();
    } else {
        // Force reload of data.js
        const script = document.createElement('script');
        script.src = 'js/data.js';
        script.onload = function() {
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        };
        document.head.appendChild(script);
    }
}

// Render product grid (helper function)
function renderProductGrid(container, products) {
    console.log('Rendering product grid with', products.length, 'products');
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; grid-column: 1 / -1;">
                <p class="muted">No products available</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product._id || product.id}">
            <a href="product.html?id=${product._id || product.id}">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'">
            </a>
            <h3><a href="product.html?id=${product._id || product.id}">${product.name}</a></h3>
            <p class="brand">${product.brand || 'Unknown Brand'}</p>
            <p class="description">${product.short || (product.description ? product.description.substring(0, 80) : 'No description')}...</p>
            <div class="price">R${product.price ? product.price.toFixed(2) : '0.00'}</div>
            <div class="rating">⭐ ${product.rating || 4.0}</div>
            <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)" 
                    class="btn primary add-to-cart">
                Add to Cart
            </button>
        </div>
    `).join('');
}

// Render product details page
async function renderProductDetail() {
    const container = $('#productDetail');
    const notFound = $('#notFound');
    const loadingElement = $('#loadingProduct') || $('.loading-product');
    
    if (!container) return;
    
    console.log('Starting renderProductDetail...');
    
    try {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        console.log('Looking for product with ID:', productId);
        
        if (!productId) {
            console.error('No product ID in URL');
            if (notFound) {
                notFound.classList.remove('hidden');
            }
            return;
        }
        
        let product = null;
        
        // Try to find product in already loaded products first
        if (window.PRODUCTS && window.PRODUCTS.length > 0) {
            console.log('Searching in window.PRODUCTS. Count:', window.PRODUCTS.length);
            product = window.PRODUCTS.find(p => 
                (p._id === productId) || 
                (p.id === productId) ||
                ((p._id || p.id) && (p._id || p.id).toString() === productId)
            );
            
            if (product) {
                console.log('Found product in window.PRODUCTS:', product.name);
            } else {
                console.log('Product not found in window.PRODUCTS. Available IDs:', 
                    window.PRODUCTS.map(p => p.id || p._id));
            }
        } else {
            console.log('window.PRODUCTS is empty or undefined');
        }
        
        // If not found in local data, try API call
        if (!product) {
            console.log('Product not found in local data, trying API...');
            try {
                const response = await fetch(`${API_BASE}/products/${productId}`);
                if (response.ok) {
                    const result = await response.json();
                    product = result.data || result;
                    console.log('Found product via API:', product?.name);
                } else {
                    console.error('API response not OK:', response.status);
                }
            } catch (apiError) {
                console.error('API error:', apiError);
            }
        }
        
        // If still not found, show error
        if (!product) {
            console.error('Product not found with ID:', productId);
            if (notFound) {
                notFound.classList.remove('hidden');
            }
            if (container) {
                container.innerHTML = '';
            }
            return;
        }
        
        // Hide loading if it exists
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        console.log('Rendering product:', product.name);
        console.log('Product image path:', product.image);
        
        // Render product details
        container.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image || 'https://via.placeholder.com/500x400?text=No+Image'}" 
                     alt="${product.name}"
                     class="product-main-image"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/500x400?text=Image+Not+Found'">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <div class="product-brand">${product.brand || 'Unknown Brand'}</div>
                <div class="product-price">R${product.price ? product.price.toFixed(2) : '0.00'}</div>
                <div class="product-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(product.rating || 0))}</span>
                    <span class="rating-value">${product.rating ? product.rating.toFixed(1) : '0.0'}/5.0</span>
                </div>
                <div class="product-description">
                    <p>${product.description || product.short || 'No description available.'}</p>
                </div>
                <div class="product-specs">
                    <div class="spec-item">
                        <span class="spec-label">Category:</span>
                        <span class="spec-value">${product.category || 'Uncategorized'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Availability:</span>
                        <span class="spec-value">${(product.stock || 0) > 0 ? 
                            `<span style="color:#28a745;">In Stock (${product.stock} available)</span>` : 
                            '<span style="color:#dc3545;">Out of Stock</span>'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Brand:</span>
                        <span class="spec-value">${product.brand || 'Unknown'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Product ID:</span>
                        <span class="spec-value">${product.id || product._id || 'N/A'}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="updateProductQuantity(-1)">-</button>
                        <input type="number" id="productQuantity" class="quantity-input" value="1" min="1" max="${product.stock || 99}">
                        <button class="quantity-btn" onclick="updateProductQuantity(1)">+</button>
                    </div>
                    <button onclick="addProductToCart()" class="btn primary btn-large" 
                            ${(product.stock || 0) <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        ${(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        
        // Render related products
        renderRelatedProducts(product);
        
    } catch (error) {
        console.error('Error in renderProductDetail:', error);
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (notFound) {
            notFound.innerHTML = `
                <h2>Error Loading Product</h2>
                <p>${error.message || 'Failed to load product details'}</p>
                <a href="index.html" class="btn primary">Back to Products</a>
            `;
            notFound.classList.remove('hidden');
        }
    }
}

// Helper function for quantity updates on product page
function updateProductQuantity(change) {
    const input = $('#productQuantity');
    if (!input) return;
    
    let current = parseInt(input.value) || 1;
    const max = parseInt(input.max) || 99;
    const min = parseInt(input.min) || 1;
    
    current += change;
    
    if (current < min) current = min;
    if (current > max) current = max;
    
    input.value = current;
}

// Helper function to add product to cart from product page
function addProductToCart() {
    const input = $('#productQuantity');
    const quantity = input ? parseInt(input.value) || 1 : 1;
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        toast('Cannot add product: Product ID missing', 'danger');
        return;
    }
    
    // Find the product in window.PRODUCTS
    let product = null;
    if (window.PRODUCTS && window.PRODUCTS.length > 0) {
        product = window.PRODUCTS.find(p => 
            (p._id === productId) || 
            (p.id === productId) ||
            ((p._id || p.id) && (p._id || p.id).toString() === productId)
        );
    }
    
    if (!product) {
        toast('Product not found', 'danger');
        return;
    }
    
    addToCart(product, quantity);
}

// Render related products
function renderRelatedProducts(currentProduct) {
    const container = $('#relatedProductsGrid');
    const relatedSection = $('#relatedProducts');
    
    if (!container || !window.PRODUCTS || window.PRODUCTS.length === 0) {
        if (relatedSection) {
            relatedSection.style.display = 'none';
        }
        return;
    }
    
    // Filter out current product and get related products (same category)
    const relatedProducts = window.PRODUCTS.filter(p => {
        const pId = p.id || p._id;
        const currentId = currentProduct.id || currentProduct._id;
        return pId !== currentId && p.category === currentProduct.category;
    }).slice(0, 4); // Show max 4 related products
    
    if (relatedProducts.length === 0) {
        // If no same-category products, show any other products
        const otherProducts = window.PRODUCTS.filter(p => {
            const pId = p.id || p._id;
            const currentId = currentProduct.id || currentProduct._id;
            return pId !== currentId;
        }).slice(0, 4);
        
        renderRelatedProductsGrid(container, otherProducts);
    } else {
        renderRelatedProductsGrid(container, relatedProducts);
    }
    
    // Show the related products section
    if (relatedSection && container.innerHTML.trim() !== '') {
        relatedSection.style.display = 'block';
    }
}

// Helper to render related products grid
function renderRelatedProductsGrid(container, products) {
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="muted" style="text-align:center; grid-column:1/-1;">No related products found.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id || product._id}" class="related-product-card">
            <img src="${product.image || 'https://via.placeholder.com/250x180?text=No+Image'}" 
                 alt="${product.name}"
                 class="related-product-image"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/250x180?text=Image+Not+Found'">
            <div class="related-product-info">
                <h3 class="related-product-name">${product.name}</h3>
                <div class="related-product-price">R${product.price ? product.price.toFixed(2) : '0.00'}</div>
            </div>
        </a>
    `).join('');
}

// ======================
// CHECKOUT PROCESS
// ======================

// Proceed to checkout
function proceedToCheckout() {
    const { user } = checkAuth();
    
    if (!user) {
        toast('Please login to checkout', 'danger');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    if (cart.length === 0) {
        toast('Your cart is empty', 'danger');
        return;
    }
    
    window.location.href = 'checkout.html';
}

// Handle checkout form submission
function setupCheckout() {
    const form = $('#checkoutForm');
    if (!form) return;
    
    const { user, token } = checkAuth();
    
    // Redirect if not logged in
    if (!user || !token) {
        window.location.href = 'login.html';
        return;
    }
    
    // If cart is empty, show empty message
    if (cart.length === 0) {
        const emptyCartMsg = $('#emptyCartMessage');
        if (emptyCartMsg) {
            emptyCartMsg.classList.remove('hidden');
        }
        if (form) form.classList.add('hidden');
        const orderSummary = $('#orderSummary');
        if (orderSummary) orderSummary.classList.add('hidden');
        return;
    }
    
    // Pre-fill user info
    const checkoutName = $('#checkoutName');
    const checkoutEmail = $('#checkoutEmail');
    if (checkoutName) checkoutName.value = user.name || '';
    if (checkoutEmail) checkoutEmail.value = user.email || '';
    
    // Render order summary
    const summary = $('#orderItems');
    if (summary && cart.length > 0) {
        summary.innerHTML = cart.map(item => `
            <div class="order-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>R${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        const total = calculateTotal();
        summary.innerHTML += `
            <div class="order-total">
                <strong>Total</strong>
                <strong>R${total.toFixed(2)}</strong>
            </div>
        `;
        
        const cartTotalElement = $('#cartTotal');
        if (cartTotalElement) {
            cartTotalElement.textContent = `R${total.toFixed(2)}`;
        }
    }
    
    // Handle form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
            name: $('#checkoutName').value,
            email: $('#checkoutEmail').value,
            address: $('#checkoutAddress').value,
            city: $('#checkoutCity').value,
            postalCode: $('#checkoutPostalCode').value
        };
        
        // Validate form
        if (!formData.address || !formData.city || !formData.postalCode) {
            toast('Please fill in all shipping information', 'danger');
            return;
        }
        
        const orderData = {
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            shipping: formData
        };
        
        try {
            const response = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Show confirmation
                const confirmation = $('#orderConfirmation');
                if (confirmation) {
                    const orderId = result.order?.id || result.data?._id || 'N/A';
                    const orderTotal = result.order?.total || result.data?.total || 0;
                    const orderStatus = result.order?.status || result.data?.status || 'Pending';
                    
                    confirmation.innerHTML = `
                        <div class="success-message">
                            <h2>🎉 Order Placed Successfully!</h2>
                            <p>Thank you for your order, ${user.name}!</p>
                            <p><strong>Order ID:</strong> ${orderId.substring(0, 8)}</p>
                            <p><strong>Total:</strong> R${orderTotal.toFixed(2)}</p>
                            <p><strong>Status:</strong> ${orderStatus}</p>
                            <p>Shipping to: ${formData.address}, ${formData.city}, ${formData.postalCode}</p>
                            <p>You will receive a confirmation email shortly.</p>
                            <div style="margin-top: 20px;">
                                <a href="orders.html" class="btn primary">View My Orders</a>
                                <a href="index.html" class="btn">Continue Shopping</a>
                            </div>
                        </div>
                    `;
                    confirmation.classList.remove('hidden');
                    form.classList.add('hidden');
                    const checkoutSummary = $('.checkout-summary');
                    if (checkoutSummary) checkoutSummary.classList.add('hidden');
                }
                
                // Clear cart
                clearCart();
                toast('Order placed successfully!', 'success');
                
            } else {
                throw new Error(result.error || result.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast(error.message || "Failed to place order. Please try again.", 'danger');
        }
    };
}

// ======================
// FILTER FUNCTIONS
// ======================

// Update filter dropdowns
async function updateFilterOptions(products = null) {
    try {
        if (!products) {
            // Try to use data.js's loaded products
            if (window.PRODUCTS && window.PRODUCTS.length > 0) {
                products = window.PRODUCTS;
            } else {
                const response = await fetch(`${API_BASE}/products`);
                if (!response.ok) return;
                const result = await response.json();
                products = result.data || result;
            }
        }
        
        // Update category dropdown
        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
            const currentValue = categorySelect.value;
            
            categorySelect.innerHTML = '<option value="">All Categories</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            
            if (categories.includes(currentValue)) {
                categorySelect.value = currentValue;
            }
        }
        
        // Update brand dropdown
        const brandSelect = document.getElementById('brandSelect');
        if (brandSelect) {
            const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
            const currentValue = brandSelect.value;
            
            brandSelect.innerHTML = '<option value="">All Brands</option>' + 
                brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
            
            if (brands.includes(currentValue)) {
                brandSelect.value = currentValue;
            }
        }
    } catch (error) {
        console.error('Error updating filter options:', error);
    }
}

// Apply filters
async function applyFilters() {
    const category = document.getElementById('categorySelect')?.value || '';
    const brand = document.getElementById('brandSelect')?.value || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'relevance';
    
    try {
        let products;
        
        // Try to use data.js's loaded products first
        if (window.PRODUCTS && window.PRODUCTS.length > 0) {
            products = [...window.PRODUCTS];
        } else {
            // Fallback to API call
            const response = await fetch(`${API_BASE}/products`);
            if (!response.ok) throw new Error('Failed to load products');
            
            const result = await response.json();
            products = result.data || result;
        }
        
        let filteredProducts = [...products];
        
        // Apply filters
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        if (brand) {
            filteredProducts = filteredProducts.filter(p => p.brand === brand);
        }
        
        // Apply sorting
        switch(sortBy) {
            case 'priceAsc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'ratingDesc':
                filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }
        
        // Render filtered products
        const container = $('#products') || $('#productGrid');
        if (container) {
            renderProductGrid(container, filteredProducts);
        }
        
    } catch (error) {
        console.error('Error applying filters:', error);
        toast('Failed to apply filters', 'danger');
    }
}

// Setup filter event listeners
function setupFilters() {
    const categorySelect = document.getElementById('categorySelect');
    const brandSelect = document.getElementById('brandSelect');
    const sortSelect = document.getElementById('sortSelect');
    
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
    if (brandSelect) brandSelect.addEventListener('change', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
}

// ======================
// INITIALIZATION
// ======================

// Initialize based on current page
function init() {
    const { user } = checkAuth();
    currentUser = user;
    
    // Update navigation and cart count
    updateNavigation();
    updateCartCount();
    
    // Page-specific initialization
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path.includes('/index.html')) {
        // Home page
        console.log('Initializing home page...');
        setupFilters();
        
        // Check if products are already loaded
        if (window.PRODUCTS && window.PRODUCTS.length > 0) {
            console.log('Products already loaded, rendering...');
            renderProducts();
        } else {
            console.log('Products not loaded yet, will render when loaded...');
            // Set a timeout to check again
            setTimeout(() => {
                if (window.PRODUCTS && window.PRODUCTS.length > 0) {
                    renderProducts();
                } else {
                    console.log('Still no products, calling renderProducts to show loading...');
                    renderProducts();
                }
            }, 300);
        }
        
    } else if (path.includes('cart.html')) {
        // Cart page
        renderCart();
        
        // Setup clear cart button
        const clearBtn = $('#clearCartBtn');
        if (clearBtn) {
            clearBtn.onclick = clearCart;
        }
        
        // Setup checkout button if exists
        const checkoutBtn = $('#checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.onclick = proceedToCheckout;
        }
        
    } else if (path.includes('checkout.html')) {
        // Checkout page
        setupCheckout();
        
    } else if (path.includes('product.html')) {
        // Product detail page
        console.log('Initializing product detail page...');
        renderProductDetail();
    }
    
    // Note: login.html and register.html are handled by auth.js
    // Note: orders.html is handled by orders.js
}

// Add this to your app.js after the init() function:

// Listen for products loaded event from data.js
document.addEventListener('productsLoaded', function() {
  console.log('productsLoaded event received in app.js');
  
  // If we're on the home page, render products
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    console.log('Home page active, rendering products...');
    renderProducts();
  }
  
  // If we're on a product page, render product details
  if (window.location.pathname.includes('product.html')) {
    console.log('Product page active, rendering product details...');
    renderProductDetail();
  }
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.proceedToCheckout = proceedToCheckout;
window.logout = logout;
window.clearCart = clearCart;
window.applyFilters = applyFilters;
window.updateProductQuantity = updateProductQuantity;
window.addProductToCart = addProductToCart;
window.retryLoadProducts = retryLoadProducts;
window.renderProducts = renderProducts;

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also listen for a custom event from data.js when products are loaded
document.addEventListener('productsLoaded', function() {
    console.log('productsLoaded event received in app.js');
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        console.log('Home page active, rendering products...');
        renderProducts();
    }
});