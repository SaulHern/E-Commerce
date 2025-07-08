document.addEventListener('DOMContentLoaded', () => {
    // --- PRODUCT DATA ---
    const products = [
        { id: 1, name: 'Throw Pillow', price: 29.00, image: 'images/throw-pillow.png' },
        { id: 2, name: 'Table Lamp', price: 89.00, image: 'images/table-lamp.png' },
        { id: 3, name: 'Knit Throw', price: 39.00, image: 'images/knit-throw.png' },
        { id: 4, name: 'Round Shelf', price: 59.00, image: 'images/round-shelf.png' }
    ];

    // --- CART STATE ---
    // Load cart from localStorage or initialize as an empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- DOM ELEMENTS ---
    const productGrid = document.getElementById('product-grid');
    const cartIconContainer = document.querySelector('.cart-icon-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartBadge = document.getElementById('cart-badge');
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentForm = document.getElementById('payment-form');

    // --- FUNCTIONS ---

    // Function to render products on the homepage
    const renderProducts = () => {
        if (!productGrid) return;
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `).join('');
    };

    // Function to render items in the cart sidebar
    const renderCart = () => {
        if (!cartItemsContainer) return;

        // Render cart items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <p>$${product.price.toFixed(2)}</p>
                            <div class="quantity-control">
                                <button class="quantity-btn" data-id="${item.id}" data-change="-1">-</button>
                                <span class="quantity-input">${item.quantity}</span>
                                <button class="quantity-btn" data-id="${item.id}" data-change="1">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Update subtotal
        const subtotal = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.id);
            return total + (product.price * item.quantity);
        }, 0);
        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;

        // Update cart badge
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        
        // Disable checkout button if cart is empty
        if (checkoutBtn) {
            checkoutBtn.classList.toggle('disabled', cart.length === 0);
             if (cart.length === 0) {
                checkoutBtn.href = 'javascript:void(0)';
            } else {
                checkoutBtn.href = 'checkout.html';
            }
        }
    };

    // Function to save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Function to add an item to the cart
    const addToCart = (productId) => {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, quantity: 1 });
        }
        saveCart();
        renderCart();
        openCart();
    };
    
    // Function to change item quantity in the cart
    const changeQuantity = (productId, change) => {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart = cart.filter(item => item.id !== productId);
            }
        }
        saveCart();
        renderCart();
    };

    // Functions to open and close the cart
    const openCart = () => {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
    };
    const closeCart = () => {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
    };


    // --- EVENT LISTENERS ---

    // Add to cart buttons
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.id);
                addToCart(productId);
            }
        });
    }

    // Cart icon click
    if (cartIconContainer) {
        cartIconContainer.addEventListener('click', openCart);
    }

    // Close cart button and overlay click
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Quantity change buttons in cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('quantity-btn')) {
                const productId = parseInt(e.target.dataset.id);
                const change = parseInt(e.target.dataset.change);
                changeQuantity(productId, change);
            }
        });
    }

    // Handle payment form submission
    if(paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your order! (This is a demo, no payment was processed).');
            cart = []; // Clear the cart
            saveCart();
            window.location.href = 'index.html'; // Redirect to home
        });
    }

    // --- INITIALIZATION ---
    renderProducts();
    renderCart();
});
