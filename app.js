// ============================================
// Forsale AI - Frontend Application
// Pi Network Integration (Updated)
// ============================================

const loadPiSDK = () => {
    return new Promise((resolve, reject) => {
        if (window.Pi) {
            resolve(window.Pi);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://sdk.minepi.com/pi-sdk.js';
        script.onload = () => resolve(window.Pi);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://YOUR-BACKEND-URL.herokuapp.com/api'; // تأكد من تحديث هذا الرابط

let piUser = null;
let currentUser = null;
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;

const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group', subs: [] },
    { id: 'tech', name: 'إلكترونيات', icon: 'fa-laptop-code', subs: [
        { id: 'mobile', name: 'هواتف وأجهزة لوحية', filters: ['الحالة', 'الماركة', 'سعة التخزين'] },
        { id: 'laptops', name: 'حواسيب محمولة', filters: ['الماركة', 'المعالج'] },
    ]},
    { id: 'real', name: 'عقارات', icon: 'fa-building', subs: [
        { id: 'apartments', name: 'شقق', filters: ['الموقع', 'المساحة'] },
        { id: 'villas', name: 'فيلات', filters: ['الموقع', 'عدد الغرف'] },
    ]},
    { id: 'fashion', name: 'الأزياء', icon: 'fa-shirt', subs: [
        { id: 'clothes', name: 'ملابس', filters: ['الجنس', 'المقاس'] },
    ]},
];

let PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro (Titanium)',
        price: 105000,
        category: 'tech',
        description: 'جهاز آيفون 15 برو مستعمل لمدة شهر واحد، بحالة ممتازة',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {
            score: 9.2,
            market_price: 110000,
            summary: 'عرض ممتاز وسعر تنافسي',
            price_state_color: '#00f2ff'
        },
        shipping_ai: {
            eta: '3-5 أيام',
            problem_handling: 'مراقبة ذكية',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'الموديل': 'iPhone 15 Pro',
            'التخزين': '256 GB',
            'اللون': 'تيتانيوم'
        }
    }
];

// ============================================
// Pi Network Functions
// ============================================

async function authenticateWithPi() {
    try {
        const Pi = await loadPiSDK();
        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        piUser = authResult.user;
        currentUser = {
            uid: piUser.uid,
            username: piUser.username,
            accessToken: authResult.accessToken
        };
        
        localStorage.setItem('forsale_pi_user', JSON.stringify(currentUser));
        console.log('✅ Pi Authentication Success:', currentUser);
        return currentUser;
    } catch (error) {
        console.error('❌ Pi Authentication Error:', error);
        
        // 💡 التعديل #1: عرض سبب الخطأ في المصادقة
        let errorMessage = 'فشل تسجيل الدخول عبر Pi Network';
        if (error.message) {
            errorMessage += `\nالسبب: ${error.message}`;
        } else if (typeof error === 'object') {
            errorMessage += `\nالسبب (JSON): ${JSON.stringify(error, null, 2)}`;
        } else {
            errorMessage += `\nالسبب: ${error}`;
        }
        alert(errorMessage);
            
        throw error;
    }
}

function onIncompletePaymentFound(payment) {
    console.log('Incomplete payment found:', payment);
    return Pi.openPaymentDialog(payment.identifier);
}

async function createPiPayment(amount, memo, metadata) {
    try {
        const Pi = await loadPiSDK();
        const paymentData = {
            amount: amount,
            memo: memo,
            metadata: metadata
        };
        
        const payment = await Pi.createPayment(paymentData, {
            onReadyForServerApproval: (paymentId) => {
                console.log('Payment ready for approval:', paymentId);
                approvePaymentOnServer(paymentId);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log('Payment ready for completion:', paymentId, txid);
                completePaymentOnServer(paymentId, txid);
            },
            onCancel: (paymentId) => {
                console.log('Payment cancelled:', paymentId);
                alert('تم إلغاء عملية الدفع');
            },
            onError: (error, payment) => {
                console.error('Payment error:', error);
                alert('حدث خطأ في عملية الدفع'); // قد نحتاج لطباعة هذا الخطأ لاحقاً
            }
        });
        
        return payment;
    } catch (error) {
        console.error('❌ Payment Creation Error:', error);
        throw error;
    }
}

async function approvePaymentOnServer(paymentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser?.accessToken}`
            },
            body: JSON.stringify({ paymentId })
        });
        const data = await response.json();
        console.log('Payment approved:', data);
    } catch (error) {
        console.error('Server approval error:', error);
    }
}

async function completePaymentOnServer(paymentId, txid) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser?.accessToken}`
            },
            body: JSON.stringify({ paymentId, txid })
        });
        const data = await response.json();
        console.log('Payment completed:', data);
        alert('✅ تم الدفع بنجاح! Transaction: ' + txid);
    } catch (error) {
        console.error('Server completion error:', error);
    }
}

async function initiateCheckout() {
    if (!currentUser) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
    }
    
    const product = window.currentProductForPurchase;
    if (!product) return;
    
    try {
        const payment = await createPiPayment(
            product.price,
            `Forsale AI - ${product.name}`,
            {
                productId: product.id,
                productName: product.name,
                buyerId: currentUser.uid
            }
        );
        
        console.log('Payment initiated:', payment);
    } catch (error) {
        console.error('❌ Checkout error:', error);
        
        // 💡 التعديل #2: عرض سبب الخطأ في عملية الشراء
        let errorMessage = 'حدث خطأ في عملية الشراء';
        if (error.message) {
            errorMessage += `\nالسبب: ${error.message}`;
        } else if (typeof error === 'object') {
            errorMessage += `\nالسبب (JSON): ${JSON.stringify(error, null, 2)}`;
        } else {
            errorMessage += `\nالسبب: ${error}`;
        }
        alert(errorMessage);
    }
}

// ============================================
// UI/General Functions (No changes here)
// ============================================

function renderCategories() {
    const container = document.getElementById('level1-scroll');
    if (!container) return;
    container.innerHTML = CATEGORIES.map((c, i) => `
        <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color}; color:${p.ai_analysis.price_state_color}">
                    <i class="fa-solid fa-brain"></i> AI ${p.ai_analysis.score}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

function selectCategory(id, el) {
    document.querySelectorAll('#level1-scroll .cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    renderProducts();
}

function openProductDetail(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price.toLocaleString()} Pi`;
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').textContent = product.description;
    document.getElementById('ai-score').textContent = product.ai_analysis.score;
    document.getElementById('ai-market-price').textContent = `${product.ai_analysis.market_price.toLocaleString()} Pi`;
    document.getElementById('ai-summary').textContent = product.ai_analysis.summary;
    
    const specsList = document.getElementById('specs-list');
    if (specsList) {
        specsList.innerHTML = Object.entries(product.specs).map(([k, v]) => `
            <li style="padding: 5px 0; border-bottom: 1px dashed rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                <span style="color:var(--text-muted);">${k}</span>
                <span style="font-weight: bold;">${v}</span>
            </li>
        `).join('');
    }
    
    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    window.currentProductForPurchase = product;
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function showDetailTab(tabId, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`detail-${tabId}`).style.display = 'block';
    el.classList.add('active');
}

function closeAllModals() {
    const modals = ['product-detail-modal', 'settingsModal', 'notificationsModal', 'ordersModal', 'walletModal', 'logyAiModal', 'sellerDashboardModal', 'ai-upload-modal', 'checkoutModal', 'evidenceUploadModal'];
    modals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

window.openSettingsModal = () => {
    closeAllModals();
    document.getElementById('settingsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeSettingsModal = () => {
    document.getElementById('settingsModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openNotificationsModal = () => {
    closeAllModals();
    unreadNotifications = 0;
    const dot = document.getElementById('notification-dot');
    if (dot) dot.style.display = 'none';
    document.getElementById('notificationsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeNotificationsModal = () => {
    document.getElementById('notificationsModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openOrdersModal = () => {
    closeAllModals();
    document.getElementById('ordersModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeOrdersModal = () => {
    document.getElementById('ordersModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openWalletModal = () => {
    closeAllModals();
    document.getElementById('walletModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeWalletModal = () => {
    document.getElementById('walletModal').style.display = 'none';
    document.body.style.overflow = '';
};

window.openLogyAiModal = () => {
    closeAllModals();
    document.getElementById('logyAiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeLogyAiModal = () => {
    document.getElementById('logyAiModal').style.display = 'none';
    document.body.style.overflow = '';
};

function setupLogin() {
    const piLoginBtn = document.getElementById('pi-login-btn');
    const loginBtn = document.getElementById('login-btn');
    
    if (piLoginBtn) {
        piLoginBtn.addEventListener('click', async () => {
            piLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري المصادقة...';
            piLoginBtn.disabled = true;
            
            try {
                await authenticateWithPi();
                showApp();
            } catch (error) {
                piLoginBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Browser';
                piLoginBtn.disabled = false;
            }
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            currentUser = {
                uid: 'test_' + Date.now(),
                username: 'مستخدم تجريبي'
            };
            localStorage.setItem('forsale_pi_user', JSON.stringify(currentUser));
            showApp();
        });
    }
}

function checkLoginStatus() {
    const saved = localStorage.getItem('forsale_pi_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        showApp();
    } else {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) authContainer.style.display = 'flex';
    }
}

function showApp() {
    closeAllModals();
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    if (authContainer) authContainer.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    initializeApp();
}

function initializeApp() {
    renderCategories();
    renderProducts();
    const dot = document.getElementById('notification-dot');
    if (dot) dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadPiSDK();
        
        // تهيئة Pi SDK
        Pi.init({ version: "2.0", sandbox: false }); // تأكد من القيمة: false للمين نت، true للساند بوكس

        console.log('✅ Pi SDK loaded and initialized');
    } catch (error) {
        console.warn('⚠️ Pi SDK not available (normal outside Pi Browser)');
    }
    
    setupLogin();
    checkLoginStatus();
});

window.authenticateWithPi = authenticateWithPi;
window.createPiPayment = createPiPayment;
window.initiateCheckout = initiateCheckout;
window.openProductDetail = openProductDetail;
window.closeProductDetailModal = closeProductDetailModal;
window.showDetailTab = showDetailTab;
window.showApp = showApp;
