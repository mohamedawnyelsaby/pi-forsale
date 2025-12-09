// ============================================
// إعدادات Pi Network SDK
// ============================================
const Pi = window.Pi;

// تهيئة الـ SDK
// هام: اجعل sandbox: true أثناء التطوير، و false عند النشر النهائي (Mainnet)
Pi.init({ version: "2.0", sandbox: true });

// متغيرات عامة
let currentUser = null;
let accessToken = null;

// ============================================
// 1. وظائف المصادقة (Login with Pi)
// ============================================

// دالة التحقق من المدفوعات غير المكتملة (مطلب أساسي من Pi)
function onIncompletePaymentFound(payment) {
    // إرسال الدفعة للخادم لإكمالها
    // fetch('/api/incomplete', { method: 'POST', body: JSON.stringify(payment) ... });
    console.log("تم العثور على دفعة غير مكتملة:", payment);
    // بعد المعالجة: Pi.createPayment(...) للإكمال
}

async function authenticateUser() {
    try {
        const scopes = ['username', 'payments']; // الصلاحيات المطلوبة
        
        // طلب المصادقة من المستخدم
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        accessToken = authResult.accessToken;
        currentUser = authResult.user;

        console.log("تم تسجيل الدخول بنجاح:", currentUser.username);
        
        // تخزين البيانات محلياً للجلسة
        localStorage.setItem('forsale_pi_user', JSON.stringify(currentUser));
        
        // إظهار التطبيق
        showApp();
        
        // تحديث واجهة المستخدم باسم المستخدم الحقيقي
        alert(`مرحباً بك يا @${currentUser.username} في Forsale AI!`);

    } catch (error) {
        console.error("فشل تسجيل الدخول:", error);
        alert("فشل الاتصال بـ Pi Network. يرجى المحاولة مرة أخرى.");
    }
}

// تعديل دالة setupLogin لتعمل مع Pi
function setupLogin() {
    const loginBtn = document.getElementById('pi-login-btn');
    const normalLoginBtn = document.getElementById('login-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            authenticateUser();
        });
    }
    
    // إتاحة الدخول العادي للمعاينة فقط
    if(normalLoginBtn) {
        normalLoginBtn.addEventListener('click', () => {
             // محاكاة للدخول العادي (اختياري)
             showApp();
        });
    }
}

// ============================================
// 2. وظائف الدفع (Pi Payments)
// ============================================

async function createPayment(productName, amount) {
    try {
        const paymentData = {
            amount: amount,
            memo: `شراء: ${productName} - Forsale AI`,
            metadata: { productId: 'p123', type: 'product' } // بيانات إضافية للخادم
        };

        const callbacks = {
            onReadyForServerApproval: (paymentId) => {
                console.log("جاهز للموافقة من الخادم:", paymentId);
                // هنا يجب إرسال paymentId إلى الخادم الخاص بك (Backend) للموافقة
                // مثال: axios.post('/api/approve', { paymentId })
                // بما أننا لا نملك خادماً الآن، سنحاكي الموافقة في Sandbox
                alert("بانتظار موافقة الخادم... (في التطبيق الحقيقي سيتم هذا تلقائياً)");
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log("جاهز للإكمال:", paymentId, txid);
                // هنا يرسل الخادم طلب إكمال العملية لـ Pi
                // مثال: axios.post('/api/complete', { paymentId, txid })
                alert("تمت عملية الدفع بنجاح! شكراً لك.");
                closeCheckoutModal();
                openOrdersModal();
            },
            onCancel: (paymentId) => {
                console.log("تم إلغاء الدفع:", paymentId);
                alert("تم إلغاء عملية الدفع.");
            },
            onError: (error, payment) => {
                console.error("حدث خطأ في الدفع:", error);
                alert("خطأ في عملية الدفع.");
            },
        };

        // بدء عملية الدفع
        await Pi.createPayment(paymentData, callbacks);

    } catch (error) {
        console.error("فشل إنشاء الدفع:", error);
        alert("لا يمكن إنشاء عملية الدفع حالياً.");
    }
}

// ربط زر الشراء بوظيفة الدفع الحقيقية
function checkout() {
    // مثال: شراء آيفون بسعر 10 Pi (للتجربة)
    // ملاحظة: المبالغ في Pi Sandbox للتجربة فقط
    createPayment("iPhone 15 Pro", 10);
}

// ============================================
// 3. باقي منطق التطبيق (الواجهة والتنقل)
// ============================================
// (نفس الوظائف السابقة للعرض وإخفاء النوافذ - يتم دمجها هنا)

function showApp() {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initializeApp();
}

function closeAllModals() {
    const modals = document.querySelectorAll('#product-detail-modal, #ai-upload-modal, #settingsModal, #checkoutModal, #ordersModal, #walletModal, #evidenceUploadModal, #notificationsModal, #sellerDashboardModal, #logyAiModal');
    modals.forEach(modal => modal.style.display = 'none');
    document.body.style.overflow = '';
}

// ... (انسخ بقية دوال فتح وإغلاق النوافذ ورسم المنتجات من الكود السابق هنا) ...

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    
    // لا نستدعي checkLoginStatus تلقائياً هنا لأننا نعتمد على Pi.authenticate
    // التي تتطلب تفاعل المستخدم أولاً
});

// وظائف مساعدة (لتشغيل الكود السابق)
// يرجى دمج دالة renderCategories, renderProducts, وغيرها هنا
// ...
const PRODUCTS = [
    { id: 'p1', name: 'iPhone 15 Pro (Titanium)', price: 105, cat: 'tech', details: 'جهاز آيفون 15 برو...', img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro', ai_analysis: { score: 9.2, market_price: 110, summary: 'عرض ممتاز...', price_state_color: '#00f2ff' }, shipping_ai: { eta: '3-5 أيام عمل', problem_handling: 'مراقبة AI', carrier: 'Logy AI Express' }, specs: { 'الماركة': 'أبل' } }
];
// (تأكد من تحديث مصفوفة المنتجات كما في الكود السابق)
