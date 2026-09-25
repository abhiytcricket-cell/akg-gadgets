// Default Initial Data with New Categories
const defaultProducts = [
    { id: 1, name: "AMOLED Display for iPhone 13 Pro", category: "Displays", price: 6500, moq: 2, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80" },
    { id: 2, name: "65W Fast Wall Charger (Type-C QC 3.0)", category: "Chargers", price: 350, moq: 10, image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80" },
    { id: 3, name: "Original Capacity Battery for Samsung M31", category: "Batteries", price: 450, moq: 5, image: "https://images.unsplash.com/photo-1609592424104-97d4b4f53c05?auto=format&fit=crop&w=500&q=80" },
    { id: 4, name: "Bluetooth Calling Smart Watch Ultra", category: "Smart Watches", price: 1150, moq: 5, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80" },
    { id: 5, name: "20000mAh Fast Charging Power Bank", category: "Power Banks", price: 850, moq: 5, image: "https://images.unsplash.com/photo-1609592424104-97d4b4f53c05?auto=format&fit=crop&w=500&q=80" },
    { id: 6, name: "Portable Waterproof Bluetooth Speaker", category: "Speakers", price: 600, moq: 5, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=500&q=80" },
    { id: 7, name: "Wireless Mobile Gaming Gamepad Controller", category: "Gamepads", price: 750, moq: 5, image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&q=80" },
    { id: 8, name: "Liquid Silicone Back Cover (Bulk Mix)", category: "Back Covers", price: 60, moq: 25, image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=500&q=80" }
];

// Load State from LocalStorage or Defaults
let products = JSON.parse(localStorage.getItem('akg_products')) || defaultProducts;
let storeSettings = JSON.parse(localStorage.getItem('akg_settings')) || {
    whatsapp: "919888136663",
    phone: "+91 98881-36663"
};
let cart = [];
let currentFilter = 'all';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartTrigger = document.getElementById('cartTrigger');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartCount = document.getElementById('cartCount');
const cartBody = document.getElementById('cartBody');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryNav = document.getElementById('categoryNav');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');
const productCountBadge = document.getElementById('productCountBadge');

// Admin Elements
const adminModal = document.getElementById('adminModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const footerAdminLink = document.getElementById('footerAdminLink');
const closeAdmin = document.getElementById('closeAdmin');
const addProductForm = document.getElementById('addProductForm');
const adminProductTable = document.getElementById('adminProductTable');
const settingsForm = document.getElementById('settingsForm');
const settingWhatsapp = document.getElementById('settingWhatsapp');
const settingPhone = document.getElementById('settingPhone');
const topPhoneText = document.getElementById('topPhoneText');
const footerPhone = document.getElementById('footerPhone');
const whatsappBtn = document.getElementById('whatsappBtn');
const floatingWhatsapp = document.getElementById('floatingWhatsapp');

// Initialize App
function initApp() {
    renderProducts();
    updateContactInfo();
    setupEventListeners();
}

// Render Products Catalog
function renderProducts(filterCat = 'all', searchQuery = '') {
    productGrid.innerHTML = '';
    
    let filtered = products.filter(p => {
        const matchesCategory = filterCat === 'all' || p.category === filterCat;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    currentCategoryTitle.textContent = filterCat === 'all' ? 'Wholesale Catalog' : filterCat;
    productCountBadge.textContent = `Showing ${filtered.length} items`;

    if (filtered.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color:#64748b;">No wholesale items found matching your criteria.</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80'">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h4 class="product-title">${product.name}</h4>
                <div class="product-moq">Min. Wholesale Qty: <b>${product.moq} pcs</b></div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += product.moq;
    } else {
        cart.push({ ...product, qty: product.moq });
    }
    updateCartUI();
    openCartDrawer();
}

// Update Cart UI
function updateCartUI() {
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBody.innerHTML = '';

    if (cart.length === 0) {
        cartBody.innerHTML = `<p style="text-align:center; color:#64748b; margin-top:40px;">Your wholesale order list is empty.</p>`;
        cartTotalPrice.textContent = '₹0';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div>
                <h5 style="font-size:13px; font-weight:600;">${item.name}</h5>
                <small style="color:#64748b;">₹${item.price} × ${item.qty} pcs</small>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-weight:700;">₹${itemTotal}</span>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartBody.appendChild(row);
    });

    cartTotalPrice.textContent = `₹${total}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function openCartDrawer() {
    cartDrawer.classList.add('open');
    overlay.classList.add('active');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('active');
}

// Update Contact Settings in DOM
function updateContactInfo() {
    topPhoneText.textContent = storeSettings.phone;
    topPhoneText.href = `tel:${storeSettings.phone}`;
    footerPhone.textContent = storeSettings.phone;
    
    settingWhatsapp.value = storeSettings.whatsapp;
    settingPhone.value = storeSettings.phone;

    const waLink = `https://wa.me/${storeSettings.whatsapp}?text=Hello%20AKG%20Wholesale,%20I%20want%20to%20inquire%20about%20bulk%20products.`;
    whatsappBtn.href = waLink;
    floatingWhatsapp.href = waLink;
}

// Event Listeners Setup
function setupEventListeners() {
    cartTrigger.addEventListener('click', openCartDrawer);
    closeCart.addEventListener('click', closeCartDrawer);
    overlay.addEventListener('click', () => {
        closeCartDrawer();
        adminModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Search
    searchBtn.addEventListener('click', () => {
        renderProducts(currentFilter, searchInput.value);
    });
    searchInput.addEventListener('keyup', (e) => {
        renderProducts(currentFilter, searchInput.value);
    });

    // Categories Navigation
    categoryNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-category');
            renderProducts(currentFilter, searchInput.value);
        }
    });

    // Checkout via WhatsApp
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        let message = "📦 *New B2B Wholesale Order - AKG Store* 📦\n\n";
        let total = 0;
        cart.forEach((item, index) => {
            let sub = item.price * item.qty;
            total += sub;
            message += `${index + 1}. *${item.name}*\n   Qty: ${item.qty} pcs | Price: ₹${sub}\n\n`;
        });
        message += `-------------------\n*Estimated Total: ₹${total}*\n-------------------\nPlease confirm availability and dispatch details.`;

        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${storeSettings.whatsapp}?text=${encoded}`, '_blank');
    });

    // Admin Modal Controls with Password Protection
    const openAdmin = (e) => {
        e.preventDefault();
        
        const passwordInput = prompt("Enter Admin Secret Password:");
        const secureAdminPassword = "Unisoasi@1980"; 

        if (passwordInput === secureAdminPassword) {
            adminModal.classList.add('active');
            overlay.classList.add('active');
            renderAdminInventory();
        } else if (passwordInput !== null) {
            alert("Incorrect password! Access denied.");
        }
    };

    adminLoginBtn.addEventListener('click', openAdmin);
    footerAdminLink.addEventListener('click', openAdmin);
    closeAdmin.addEventListener('click', () => {
        adminModal.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Admin Tabs Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Add Product Form Handler
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProd = {
            id: Date.now(),
            name: document.getElementById('pName').value,
            category: document.getElementById('pCategory').value,
            price: Number(document.getElementById('pPrice').value),
            moq: Number(document.getElementById('pMinQty').value),
            image: document.getElementById('pImage').value
        };

        products.push(newProd);
        localStorage.setItem('akg_products', JSON.stringify(products));
        renderProducts(currentFilter, searchInput.value);
        renderAdminInventory();
        addProductForm.reset();
        alert('Product added successfully!');
    });

    // Save Settings Handler
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        storeSettings.whatsapp = settingWhatsapp.value;
        storeSettings.phone = settingPhone.value;
        localStorage.setItem('akg_settings', JSON.stringify(storeSettings));
        updateContactInfo();
        alert('Store settings updated successfully!');
    });
}

// Render Admin Inventory List
function renderAdminInventory() {
    adminProductTable.innerHTML = '';
    products.forEach(p => {
        const row = document.createElement('div');
        row.className = 'admin-item-row';
        row.innerHTML = `
            <div>
                <strong>${p.name}</strong><br>
                <small>${p.category} | ₹${p.price} | MOQ: ${p.moq}</small>
            </div>
            <button class="delete-prod-btn" onclick="deleteProduct(${p.id})">Delete</button>
        `;
        adminProductTable.appendChild(row);
    });
}

// Delete Product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('akg_products', JSON.stringify(products));
        renderProducts(currentFilter, searchInput.value);
        renderAdminInventory();
    }
}

// Run application
initApp();