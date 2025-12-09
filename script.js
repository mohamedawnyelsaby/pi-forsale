// ============================================
// 🔥 Forsale AI - Complete Pi Network Integration
// ============================================

// 🌐 Backend Configuration (استبدل بـ URL الخاص بك)
const BACKEND_URL = 'https://your-backend-url.com'; // غير هذا!

// 🔐 Pi SDK Global Variables
let piUser = null;
let currentPaymentId = null;
let currentProduct = null;

// 🗄️ Local Storage Keys
const STORAGE_KEYS = {
    USERS: 'forsale_users',
    CURRENT_USER: 'forsale_current_user',
    PRODUCTS: 'forsale_products',
    ORDERS: 'forsale_orders'
};

// ============================================
// 1. Pi Network SDK Initialization
// ============================================
function initializePiSDK() {
    if (typeof Pi === 'undefined') {
        console.error('❌ Pi SDK not loaded! Make sure you are in Pi Browser.');
        return;
    }
    
    console.log('✅ Pi SDK Loaded Successfully');
    
    // 🔐 تهيئة SDK
    Pi.init({ 
        version: "2.0", 
        sandbox: true // استخدم Testnet أولاً
    });
}

// ============================================
// 2. Pi Network Authentication
// ============================================
async function authenticateWithPi() {
    try {
        console.log('🔐 Starting Pi Authentication...');
        
        // استدعاء Pi.authenticate()
        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        piUser = authResult.user;
        console.log('✅ Pi User Authenticated:', piUser);
        
        // حفظ بيانات المستخدم
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
            uid: piUser.uid,
            username: piUser.username,
            loginMethod: 'pi_network'
        }));
        
        // عرض اسم المستخدم في الواجهة
        document.getElementById('pi-user-info').style.display = 'flex';
        document.getElementById('pi-username').textContent = piUser.username;
        
        // الانتقال للتطبيق
        showApp();
        
        return piUser;
    } catch (error) {
        console.error('❌ Pi Authentication Failed:', error);
        alert('فشل تسجيل الدخول عبر Pi Network. تأكد من أنك في Pi Browser.');
        return null;
    }
}

// ============================================
// 3. Handle Incomplete Payments (CRITICAL!)
// ============================================
function onIncompletePaymentFound(payment) {
    console.log('⚠️ Incomplete Payment Found:', payment);
    
    // إرسال الدفع للـ backend للمعالجة
    fetch(`${BACKEND_URL}/payment/incomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment })
    })
    .then(res => res.json())
    .then(data => {
        console.log('✅ Incomplete payment processed:', data);
    })
    .catch(error => {
        console.error('❌ Error processing incomplete payment:', error);
    });
}

// ============================================
// 4. Create Payment (STEP 10 - CRITICAL!)
// ============================================
async function createPiPayment(product) {
    try {
        console.log('💰 Creating Pi Payment for:', product);
        
        if (!piUser) {
            alert('يجب تسجيل الدخول عبر Pi Network أولاً');
            return;
        }
        
        // فتح نافذة الدفع Pi
        const paymentData = {
            amount: product.price,
            memo: `شراء ${product.name} - Forsale AI`,
            metadata: { 
                productId: product.id,
                productName: product.name 
            }
        };
        
        const payment = await Pi.createPayment(paymentData, {
            onReadyForServerApproval: (paymentId) => {
                console.log('✅ Payment Ready for Approval:', paymentId);
                approvePaymentOnBackend(paymentId, product);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log('✅ Payment Ready for Completion:', paymentId, txid);
                completePaymentOnBackend(paymentId, txid);
            },
            onCancel: (paymentId) => {
                console.log('❌ Payment Cancelled:', paymentId);
                alert('تم إلغاء عملية الدفع');
            },
            onError: (error, payment) => {
                console.error('❌ Payment Error:', error, payment);
                alert('حدث خطأ في عملية الدفع: ' + error.message);
            }
        });
        
        currentPaymentId = payment.identifier;
        currentProduct = product;
        
        return payment;
    } catch (error) {
        console.error('❌ Payment Creation Failed:', error);
        alert('فشل إنشاء عملية الدفع. حاول مرة أخرى.');
    }
}

// ============================================
// 5. Backend Approval (STEP 10 - CRITICAL!)
// ============================================
async function approvePaymentOnBackend(paymentId, product) {
    try {
        console.log('📡 Sending Approval to Backend:', paymentId);
        
        const response = await fetch(`${BACKEND_URL}/payment/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                paymentId, 
                productId: product.id 
            })
        });
        
        const data = await response.json();
        console.log('✅ Backend Approval Response:', data);
        
        return data;
    } catch (error) {
        console.error('❌ Backend Approval Failed:', error);
        throw error;
    }
}

// ============================================
// 6. Backend Completion (STEP 10 - CRITICAL!)
// ============================================
async function completePaymentOnBackend(paymentId, txid) {
    try {
        console.log('📡 Sending Completion to Backend:', paymentId, txid);
        
        const response = await fetch(`${BACKEND_URL}/payment/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                paymentId, 
                txid 
            })
        });
        
        const data = await response.json();
        console.log('✅ Backend Completion Response:', data);
        
        // حفظ الطلب محلياً
        saveOrderToLocal(paymentId, txid, currentProduct);
        
        // إظهار رسالة نجاح
        alert('🎉 تمت عملية الشراء بنجاح! سيتم شحن منتجك قريباً.');
        
        // الانتقال لصفحة الطلبات
        closeCheckoutModal();
        openOrdersModal();
        
        return data;
    } catch (error) {
        console.error('❌ Backend Completion Failed:', error);
        alert('فشل إتمام الدفع. تواصل مع الدعم الفني.');
    }
}

// ============================================
// 7. Save Order Locally
// ============================================
function saveOrderToLocal(paymentId, txid, product) {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    
    const newOrder = {
        id: `ORD-${Date.now()}`,
        paymentId,
        txid,
        product,
        status: 'pending_shipment',
        createdAt: new Date().toISOString(),
        user: piUser
    };
    
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    console.log('✅ Order Saved Locally:', newOrder);
}

// ============================================
// 8. Login Setup
// ============================================
function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const fingerprintBtn = document.getElementById('fingerprint-login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');

    // تسجيل دخول عادي
    const handleNormalLogin = () => {
        loginBtn.innerHTML = 'جاري الدخول... <i class="fa-solid fa-spinner fa-spin"></i>';
        loginBtn.disabled = true;

        setTimeout(() => {
            const email = document.getElementById('login-email').value || 'demo@forsale.ai';
            const password = document.getElementById('login-password').value || 'demo123';

            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
                email,
                loginMethod: 'email'
            }));

            showApp();
        }, 1500);
    };

    // تسجيل دخول Pi Network
    const handlePiLogin = async () => {
        piLoginBtn.innerHTML = 'جاري الاتصال بـ Pi... <i class="fa-solid fa-spinner fa-spin"></i>';
        piLoginBtn.disabled = true;
        
        await authenticateWithPi();
        
        piLoginBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Browser';
        piLoginBtn.disabled = false;
    };

    loginBtn.addEventListener('click', handleNormalLogin);
    fingerprintBtn.addEventListener('click', handleNormalLogin);
    piLoginBtn.addEventListener('click', handlePiLogin);
}

// ============================================
// 9. Checkout Modal (Updated for Pi Payment)
// ============================================
function openCheckoutModal() {
    closeAllModals();
    
    if (!currentProduct) {
        currentProduct = PRODUCTS[0]; // منتج تجريبي
    }
    
    document.getElementById('checkout-product-name').textContent = currentProduct.name;
    document.getElementById('checkout-product-price').textContent = `${currentProduct.price.toLocaleString()} Pi`;
    document.getElementById('checkoutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = '';
}

// 🔥 UPDATED: Checkout function to use Pi Payment
async function checkout() {
    if (!piUser) {
        alert('يجب تسجيل الدخول عبر Pi Network لإتمام الدفع');
        return;
    }
    
    // إنشاء دفع Pi
    await createPiPayment(currentProduct);
}

// ============================================
// 10. Products Data (Sample)
// ============================================
const PRODUCTS = [
    { 
        id: 'p1', 
        name: 'iPhone 15 Pro (Titanium)', 
        price: 0.1, // سعر تجريبي منخفض للاختبار
        cat: 'tech', 
        details: 'جهاز آيفون 15 برو مستعمل لمدة شهر واحد، بحالة ممتازة.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro', 
        ai_analysis: { 
            score: 9.2, 
            market_price: 0.15, 
            summary: 'عرض ممتاز وسعر تنافسي.', 
            price_state_color: '#00f2ff' 
        }, 
        shipping_ai: { 
            eta: '3-5 أيام عمل', 
            problem_handling: 'مراقبة AI على مدار الساعة', 
            carrier: 'Logy AI Express' 
        }, 
        specs: { 
            'الماركة': 'أبل', 
            'الموديل': 'آيفون 15 برو', 
            'سعة التخزين': '256 جيجا بايت' 
        } 
    }
];

// ============================================
// 11. UI Functions (من الكود الأصلي)
// ============================================
function showApp() {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initializeApp();
}

function closeAllModals() {
    const modals = document.querySelectorAll('[id$="-modal"], [id$="Modal"]');
    modals.forEach(modal => modal.style.display = 'none');
    document.body.style.overflow = '';
}

function initializeApp() {
    renderProducts();
    console.log('✅ App Initialized');
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = PRODUCTS.map(p => `
        <div class="product-card glass-panel" onclick='currentProduct = ${JSON.stringify(p).replace(/'/g, "\\'")}; openProductDetail("${p.id}")'>
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color}; color:${p.ai_analysis.price_state_color};">
                     <i class="fa-solid fa-brain"></i> AI Score ${p.ai_analysis.score.toFixed(1)}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

function openProductDetail(id) {
    closeAllModals();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    currentProduct = product;

    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price.toLocaleString()} Pi`;
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').textContent = product.details;
    document.getElementById('ai-score').textContent = product.ai_analysis.score.toFixed(1);
    document.getElementById('ai-market-price').textContent = `${product.ai_analysis.market_price.toLocaleString()} Pi`;
    document.getElementById('ai-summary').textContent = product.ai_analysis.summary;

    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function showDetailTab(tabId, el) {
    document.querySelectorAll('.detail-tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`detail-${tabId}`).style.display = 'block';
    el.classList.add('active');
}

// ============================================
// 12. Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Forsale AI Starting...');
    
    // تهيئة Pi SDK
    initializePiSDK();
    
    // إعداد تسجيل الدخول
    setupLogin();
    
    // التحقق من حالة تسجيل الدخول
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.loginMethod === 'pi_network') {
            // إعادة المصادقة مع Pi
            authenticateWithPi();
        } else {
            showApp();
        }
    }
});

// ============================================
// 13. Placeholder Functions (من الكود الأصلي)
// ============================================
function openAiUploadModal() { alert('قريباً: رفع منتجات بالذكاء الاصطناعي'); }
function openNotificationsModal() { alert('قريباً: الإشعارات'); }
function openSettingsModal() { alert('قريباً: الإعدادات'); }
function openOrdersModal() { alert('قريباً: الطلبات'); }
function openWalletModal() { alert('قريباً: المحفظة'); }
function openLogyAiModal() { alert('قريباً: Logy AI Chat'); }
function showRegister() { alert('قريباً: التسجيل'); }
