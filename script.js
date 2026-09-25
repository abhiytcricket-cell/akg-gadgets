// --- CLOUD BIN CONFIGURATION ---
const BIN_ID = "6ab64b66ac6210605af3e264";       // Replace with your JSONBin ID
const API_KEY = "$2a$10$BvsQyJU6l9KtgFNhEgdyGu1TqfSS6NXs.TiKwWmzu0cj6AxI6U0HS";   // Replace with your JSONBin Master Key

let products = [];
let storeSettings = { whatsapp: "919888136663", phone: "+91 98881-36663" };
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

// Initialize App by Fetching from Cloud
async function initApp() {
    await fetchFromCloud();
    renderProducts();
    updateContactInfo();
    setupEventListeners();
}

// Fetch Data from JSONBin Cloud
async function fetchFromCloud() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await response.json();
        products = data.record.products || [];
        storeSettings = data.record.settings || storeSettings;
    } catch (error) {
        console.error("Error fetching cloud data:", error);
        alert("Failed to load live data from cloud. Check your internet connection.");
    }
}

// Save Data to JSONBin Cloud
async function saveToCloud() {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ products, settings: storeSettings })
        });
    } catch (error) {
        console.error("Error saving to cloud:", error);
        alert("Failed to sync changes to cloud.");
    }
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

    searchBtn.addEventListener('click', () => {
        renderProducts(currentFilter, searchInput.value);
    });
    searchInput.addEventListener('keyup', (e) => {
        renderProducts(currentFilter, searchInput.value);
    });

    categoryNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-category');
            renderProducts(currentFilter, searchInput.value);
        }
    });

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

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Add Product Form Handler (Saves to Cloud)
    addProductForm.addEventListener('submit', async (e) => {
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
        await saveToCloud();
        renderProducts(currentFilter, searchInput.value);
        renderAdminInventory();
        addProductForm.reset();
        alert('Product added and synced to cloud successfully!');
    });

    // Save Settings Handler (Saves to Cloud)
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        storeSettings.whatsapp = settingWhatsapp.value;
        storeSettings.phone = settingPhone.value;
        await saveToCloud();
        updateContactInfo();
        alert('Store settings updated and synced to cloud!');
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

// Delete Product & Sync Cloud
async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        await saveToCloud();
        renderProducts(currentFilter, searchInput.value);
        renderAdminInventory();
    }
}

// Run application
initApp();