document.addEventListener('DOMContentLoaded', () => {

    // --- PRODUCT DATA ---
    const products = [
        { id: 1, name: 'Throw Pillow', price: 29.00, image: 'images/throw-pillow.png' },
        { id: 2, name: 'Table Lamp', price: 89.00, image: 'images/table-lamp.png' },
        { id: 3, name: 'Knit Throw', price: 39.00, image: 'images/knit-throw.png' },
        { id: 4, name: 'Round Shelf', price: 59.00, image: 'images/round-shelf.png' }
    ];

    // --- CART STATE ---
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

    // --- AUTH DOM ELEMENTS ---
    const userStatusContainer = document.getElementById('user-status');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showSigninBtn = document.getElementById('show-signin');
    const signInContainer = document.getElementById('sign-in-container');
    const signUpContainer = document.getElementById('sign-up-container');
    const checkoutUserInfo = document.getElementById('checkout-user-info');


    // =====================================================================
    // --- AUTHENTICATION FUNCTIONS (SIMULATED) ---
    // =====================================================================

    const updateUserStatus = () => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (userStatusContainer) {
            if (currentUser) {
                userStatusContainer.innerHTML = `
                    <span>Bienvenido, ${currentUser.email}</span>
                    <a href="#" class="logout-link">(Cerrar Sesión)</a>
                `;
            } else {
                userStatusContainer.innerHTML = `<a href="checkout.html">Iniciar Sesión / Registrarse</a>`;
            }
        }
        if (checkoutUserInfo) {
             if (currentUser) {
                checkoutUserInfo.innerHTML = `<p>Comprando como: <strong>${currentUser.email}</strong></p>`;
                checkoutUserInfo.classList.remove('hidden');
             } else {
                checkoutUserInfo.classList.add('hidden');
             }
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const passwordConfirm = document.getElementById('signup-password-confirm').value;

        if (password !== passwordConfirm) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            alert("Este email ya está registrado.");
            return;
        }

        users.push({ email, password }); // En una app real, la contraseña debe ser "hasheada"
        localStorage.setItem('users', JSON.stringify(users));
        alert("¡Cuenta creada exitosamente! Por favor, inicia sesión.");
        showSigninBtn.click(); // Cambia al formulario de login
        signUpForm.reset();
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert(`Bienvenido, ${user.email}`);
            window.location.href = 'index.html'; // Redirige al inicio
        } else {
            alert("Email o contraseña incorrectos.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        updateUserStatus();
        window.location.reload();
    };

    const toggleAuthForms = () => {
        signInContainer.classList.toggle('hidden');
        signUpContainer.classList.toggle('hidden');
    };

    // =====================================================================
    // --- CORE E-COMMERCE FUNCTIONS ---
    // =====================================================================

    const renderProducts = () => {
        if (!productGrid) return;
        productGrid.innerHTML = products.map(product => `
            <div class="product-card fade-in">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
                </div>
            </div>
        `).join('');
    };

    const renderCart = () => {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
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
        const subtotal = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.id);
            return total + (product.price * item.quantity);
        }, 0);
        if(cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if(cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        if (checkoutBtn) {
            checkoutBtn.classList.toggle('disabled', cart.length === 0);
             if (cart.length === 0) {
                checkoutBtn.href = 'javascript:void(0)';
            } else {
                checkoutBtn.href = 'checkout.html';
            }
        }
    };

    const saveCart = () => { localStorage.setItem('cart', JSON.stringify(cart)); };
    const addToCart = (productId) => {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) { existingItem.quantity++; } else { cart.push({ id: productId, quantity: 1 }); }
        saveCart(); renderCart(); openCart();
    };
    const changeQuantity = (productId, change) => {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) { cart = cart.filter(item => item.id !== productId); }
        }
        saveCart(); renderCart();
    };
    const openCart = () => { if(cartSidebar) {cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); }};
    const closeCart = () => { if(cartSidebar) {cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); }};
    
    const setupFadeInObserver = () => {
        const faders = document.querySelectorAll('.fade-in');
        if (faders.length === 0) return;
        const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
        const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            });
        }, appearOptions);
        faders.forEach(fader => { appearOnScroll.observe(fader); });
    };

    // =====================================================================
    // --- EVENT LISTENERS ---
    // =====================================================================

    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) { addToCart(parseInt(e.target.dataset.id)); }
        });
    }
    if (cartIconContainer) cartIconContainer.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('quantity-btn')) { changeQuantity(parseInt(e.target.dataset.id), parseInt(e.target.dataset.change)); }
        });
    }
    if(paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert("Por favor, inicia sesión para completar tu compra.");
                return;
            }
            alert('¡Gracias por tu orden! (Esto es una demo, no se procesó ningún pago).');
            cart = []; saveCart(); window.location.href = 'index.html';
        });
    }
    
    // --- AUTH LISTENERS ---
    if (signUpForm) signUpForm.addEventListener('submit', handleSignUp);
    if (signInForm) signInForm.addEventListener('submit', handleSignIn);
    if (userStatusContainer) {
        userStatusContainer.addEventListener('click', e => {
            if (e.target.classList.contains('logout-link')) { handleLogout(); }
        });
    }
    if (showSignupBtn) showSignupBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(); });
    if (showSigninBtn) showSigninBtn.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(); });


    // =====================================================================
    // --- INITIALIZATION ---
    // =====================================================================
    renderProducts();
    renderCart();
    setupFadeInObserver();
    updateUserStatus();
});
