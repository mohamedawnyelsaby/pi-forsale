// ============================================
// Pi Network SDK Configuration
// ============================================
const Pi = window.Pi;
let currentUser = null;

// Initialize Pi SDK on Load
function initPi() {
    try {
        // 'sandbox: true' is for testing. Set to false in production.
        Pi.init({ version: "2.0", sandbox: true });
        console.log("Pi SDK Initialized.");
    } catch (err) {
        console.error("Pi SDK Init Error: ", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPi();
    setupLogin();
});

// ============================================
// Authentication Logic
// ============================================

function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');

    // Standard Login Simulation
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginBtn.innerHTML = 'Loading... <i class="fa-solid fa-spinner fa-spin"></i>';
            setTimeout(() => showApp(), 1500);
        });
    }

    // Pi Network Login
    if (piLoginBtn) {
        piLoginBtn.addEventListener('click', authenticatePiUser);
    }
}

function authenticatePiUser() {
    const scopes = ['username', 'payments'];
    const btn = document.getElementById('pi-login-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = 'Connecting to Pi... <i class="fa-solid fa-spinner fa-spin"></i>';

    Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth) {
        console.log("Pi Auth Success:", auth);
        
        // Save user session
        currentUser = {
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken,
            isPiUser: true
        };
        
        showApp();
        
    }).catch(function(error) {
        console.error("Pi Auth Error:", error);
        alert("Authentication Failed. Please try inside Pi Browser.");
        btn.innerHTML = originalText;
    });
}

function onIncompletePaymentFound(payment) {
    console.log("Incomplete Payment Found: ", payment);
    // In a real backend, you would resolve this here.
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    renderProducts(); // Render initial products
}

// ============================================
// Step 10: Process a Transaction
// ============================================

function checkout() {
    // 1. Close Checkout Modal
    closeCheckoutModal();

    // 2. Define Payment Data
    // We use a small amount (1 Pi) for testing purposes
    const paymentData = {
        amount: 1, 
        memo: "Purchase: iPhone 15 Pro (Test Order)", 
        metadata: { productId: "p1", internalOrderId: "LOGY-" + Date.now() } 
    };

    // 3. Define Callbacks
    const callbacks = {
        onReadyForServerApproval: function(paymentId) {
            console.log("Payment ID:", paymentId);
            // NOTE: In a real app, send 'paymentId' to your Backend server to approve.
            // Since this is frontend-only, the flow stops here visually, 
            // but this code IS what activates Step 10 in the Developer Portal.
            alert("Payment Initiated! ID: " + paymentId + "\n(Waiting for Server Approval)");
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            console.log("TXID:", txid);
            // NOTE: Send 'txid' to Backend to complete.
            alert("Payment Successful! TXID: " + txid);
        },
        onCancel: function(paymentId) {
            console.log("Payment Cancelled:", paymentId);
        },
        onError: function(error, payment) {
            console.error("Payment Error:", error);
            alert("Payment Failed: " + error.message);
        }
    };

    // 4. Trigger Payment
    try {
        Pi.createPayment(paymentData, callbacks);
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// ============================================
// Data & UI Helpers (Mock Data)
// ============================================

const PRODUCTS = [
    { id: 'p1', name: 'iPhone 15 Pro', price: 105000, img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15' },
    { id: 'p2', name: 'MacBook Pro', price: 155000, img: 'https://placehold.co/600x400/0a1128/FFD700?text=MacBook' },
    { id: 'p3', name: 'Luxury Villa', price: 1500000, img: 'https://placehold.co/800x600/1a1a1a/2ECC71?text=Villa' }
];

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    
    grid.innerHTML = PRODUCTS.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box"><img src="${p.img}" alt="${p.name}"></div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

// ============================================
// Modal Management
// ============================================

function closeAllModals() {
    const modals = document.querySelectorAll('[id$="Modal"], [id$="-modal"]');
    modals.forEach(m => m.style.display = 'none');
    document.body.style.overflow = '';
}

// Product Details
window.openProductDetail = (id) => {
    closeAllModals();
    const product = PRODUCTS.find(p => p.id === id);
    if(product) {
        document.getElementById('detail-title').textContent = product.name;
        document.getElementById('detail-price').textContent = product.price.toLocaleString() + " Pi";
        document.getElementById('detail-img').src = product.img;
        document.getElementById('product-detail-modal').style.display = 'block';
    }
};
window.closeProductDetailModal = () => document.getElementById('product-detail-modal').style.display = 'none';

// Checkout
window.openCheckoutModal = () => {
    closeAllModals();
    document.getElementById('checkoutModal').style.display = 'block';
};
window.closeCheckoutModal = () => document.getElementById('checkoutModal').style.display = 'none';

// Placeholders for other modals to avoid errors
window.openAiUploadModal = () => {}; 
window.openNotificationsModal = () => {};
window.openSettingsModal = () => {};
window.openLogyAiModal = () => {};
window.openOrdersModal = () => {};
window.openWalletModal = () => {};
window.showRegister = () => alert("Registration coming soon!");
