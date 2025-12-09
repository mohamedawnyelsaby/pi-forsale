// ============================================
// 1. التكوين والإعدادات (Configuration)
// ============================================
const IS_SANDBOX = true; // ⚠️ اجعلها false عند الانتقال للـ Mainnet
const BACKEND_URL = "https://your-backend-url.herokuapp.com"; // ⚠️ ضع رابط السيرفر الخلفي الخاص بك هنا

let currentUser = null;
let activeCategory = 'all';

// بيانات وهمية للمنتجات (في التطبيق الحقيقي تأتي من السيرفر)
const PRODUCTS = [
    { id: 'p1', name: 'iPhone 15 Pro (Titanium)', price: 105, cat: 'tech', details: 'جهاز آيفون 15 برو مستعمل..', img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro', ai_analysis: { score: 9.2, market_price: 110, summary: 'عرض ممتاز', price_state_color: '#00f2ff' }, shipping_ai: { eta: '3-5 أيام' }, specs: { 'الماركة': 'أبل', 'سعة': '256GB' } },
    { id: 'p2', name: 'MacBook Pro 2024', price: 200, cat: 'tech', details: 'لابتوب احترافي..', img: 'https://placehold.co/600x400/0a1128/FFD700?text=MacBook+Pro', ai_analysis: { score: 8.8, market_price: 210, summary: 'سعر عادل', price_state_color: '#FFD700' }, shipping_ai: { eta: '5-7 أيام' }, specs: { 'المعالج': 'M3', 'الرام': '32GB' } },
    { id: 'p3', name: 'فيلا مودرن بالرياض', price: 1500, cat: 'real', details: 'فيلا فاخرة..', img: 'https://placehold.co/800x600/1a1a1a/2ECC71?text=Villa', ai_analysis: { score: 9.9, market_price: 1800, summary: 'فرصة نادرة', price_state_color: '#00f2ff' }, shipping_ai: { eta: '14 يوم' }, specs: { 'المساحة': '500m', 'الموقع': 'الرياض' } }
];

// ============================================
// 2. تهيئة Pi Network
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة الـ SDK
    Pi.init({ version: "2.0", sandbox: IS_SANDBOX });

    // 2. الاستماع لزر الدخول
    const loginBtn = document.getElementById('pi-login-btn');
    if(loginBtn) {
        loginBtn.addEventListener('click', authenticateUser);
    }
    
    // 3. تفعيل البحث
    const searchInput = document.getElementById('main-search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(term));
            renderProducts(filtered);
        });
    }

    // عرض المنتجات مبدئياً
    renderProducts(PRODUCTS);
});

function authenticateUser() {
    const scopes = ['username', 'payments'];
    
    document.getElementById('pi-login-btn').style.display = 'none';
    document.getElementById('login-loading').style.display = 'block';

    Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth) {
        console.log("تم تسجيل الدخول:", auth.user.username);
        currentUser = auth.user;
        
        // الانتقال للتطبيق
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // تحديث البيانات في الإعدادات
        if(document.getElementById('profile-username')) {
            document.getElementById('profile-username').innerText = currentUser.username;
        }

    }).catch(function(error) {
        console.error(error);
        alert("فشل الاتصال بـ Pi Network. تأكد من فتح التطبيق عبر متصفح Pi.");
        document.getElementById('pi-login-btn').style.display = 'block';
        document.getElementById('login-loading').style.display = 'none';
    });
}

// معالجة المدفوعات غير المكتملة (شرط أساسي لـ Mainnet)
function onIncompletePaymentFound(payment) {
    console.log("تم العثور على دفعة غير مكتملة:", payment);
    // إرسال الدفعة للسيرفر للإكمال
    axios.post(`${BACKEND_URL}/payment/incomplete`, { payment: payment })
        .then(() => console.log("تمت معالجة الدفعة المعلقة"))
        .catch(err => console.error("خطأ في معالجة الدفعة المعلقة", err));
}

// ============================================
// 3. وظائف التطبيق الأساسية
// ============================================

function renderProducts(productList) {
    const grid = document.getElementById('products-grid');
    if (productList.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color:gray;">لا توجد منتجات تطابق بحثك.</p>';
        return;
    }
    grid.innerHTML = productList.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color}; color:${p.ai_analysis.price_state_color};">
                     <i class="fa-solid fa-brain"></i> AI Score ${p.ai_analysis.score}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

// فتح تفاصيل المنتج
window.openProductDetail = (id) => {
    closeAllModals();
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price} Pi`;
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').textContent = product.details;
    document.getElementById('ai-score').textContent = product.ai_analysis.score;
    document.getElementById('ai-market-price').textContent = `${product.ai_analysis.market_price} Pi`;
    document.getElementById('ai-summary').textContent = product.ai_analysis.summary;
    document.getElementById('shipping-eta').textContent = product.shipping_ai.eta;
    
    // ربط زر الشراء بالمنتج الحالي
    const buyBtn = document.getElementById('buy-btn-modal');
    buyBtn.onclick = () => openCheckoutModal(product);

    document.getElementById('product-detail-modal').style.display = 'block';
};

// ============================================
// 4. نظام الدفع الحقيقي (Pi Payment Logic)
// ============================================

window.openCheckoutModal = (product) => {
    closeAllModals();
    document.getElementById('checkout-product-name').textContent = product.name;
    document.getElementById('checkout-product-price').textContent = `${product.price} Pi`;
    
    const payBtn = document.getElementById('confirm-payment-btn');
    // إزالة المستمعين القدامى (لتجنب تكرار الدفع) واستبدال الزر
    const newBtn = payBtn.cloneNode(true);
    payBtn.parentNode.replaceChild(newBtn, payBtn);
    
    newBtn.addEventListener('click', () => startPiPayment(product));
    
    document.getElementById('checkoutModal').style.display = 'block';
};

function startPiPayment(product) {
    // إغلاق المودال وبدء الدفع
    document.getElementById('checkoutModal').style.display = 'none';

    // بيانات الدفع
    const paymentData = {
        amount: product.price, // المبلغ (Pi)
        memo: `شراء: ${product.name}`, // ملاحظة تظهر للمستخدم
        metadata: { productId: product.id, type: "digital_item" } // بيانات خاصة لك
    };

    const callbacks = {
        onReadyForServerApproval: function(paymentId) {
            console.log("جاهز للموافقة، PaymentID:", paymentId);
            // إرسال الطلب للسيرفر الخاص بك للموافقة
            axios.post(`${BACKEND_URL}/payment/approve`, { paymentId: paymentId, productId: product.id })
                .then(response => {
                    console.log("تمت الموافقة من السيرفر");
                })
                .catch(error => {
                    console.error("خطأ في الموافقة:", error);
                });
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            console.log("جاهز للاكتمال، TXID:", txid);
            // إرسال الطلب للسيرفر لإكمال الدفع وتسليم المنتج
            axios.post(`${BACKEND_URL}/payment/complete`, { paymentId: paymentId, txid: txid })
                .then(response => {
                    console.log("تم اكتمال الدفع!");
                    alert("مبروك! تم الشراء بنجاح. رصيدك تم تحديثه.");
                })
                .catch(error => {
                    console.error("خطأ في الاكتمال:", error);
                });
        },
        onCancel: function(paymentId) {
            console.log("المستخدم ألغى الدفع");
            alert("تم إلغاء العملية.");
        },
        onError: function(error, payment) {
            console.error("خطأ عام:", error);
            alert("حدث خطأ أثناء الدفع: " + error.message);
        },
    };

    // استدعاء دالة Pi لإنشاء الدفع
    Pi.createPayment(paymentData, callbacks);
}

// ============================================
// 5. وظائف مساعدة
// ============================================
function closeAllModals() {
    const modals = document.querySelectorAll('#product-detail-modal, #checkoutModal, #settingsModal, #logyAiModal, #auth-container');
    // نستثني Auth و App container من الإغلاق العام
    document.querySelectorAll('#product-detail-modal, #checkoutModal, #settingsModal, #logyAiModal').forEach(m => m.style.display = 'none');
}

window.closeProductDetailModal = () => document.getElementById('product-detail-modal').style.display = 'none';
window.closeCheckoutModal = () => document.getElementById('checkoutModal').style.display = 'none';
window.openSettingsModal = () => document.getElementById('settingsModal').style.display = 'block';
window.closeSettingsModal = () => document.getElementById('settingsModal').style.display = 'none';
window.openLogyAiModal = () => document.getElementById('logyAiModal').style.display = 'flex';
window.closeLogyAiModal = () => document.getElementById('logyAiModal').style.display = 'none';
window.showApp = () => closeAllModals(); // العودة للرئيسية
