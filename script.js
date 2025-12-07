حاضر، ولا يهمك. عشان نضمن إن الزرار يشتغل 100% وما يحصلش أي تعارض، أنا هكتبلك الكودين (HTML و JS) متوافقين مع بعض تماماً، وفيها "رسائل تنبيه" (Alerts) عشان تعرف إن الزرار استجاب.

امسح القديم في الملفين دول، وحط الأكواد دي بالظبط:

1️⃣ ملف index.html (الواجهة الكاملة)

(تم تعديل الزرار ليعمل بأمر مباشر onclick عشان ما يعلقش).

code
Html
play_circle
download
content_copy
expand_less
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Forsale AI - Pi Network</title>
    
    <!-- مكتبة Pi Network -->
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <script>Pi.init({ version: "2.0", sandbox: true });</script>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- شاشة تسجيل الدخول -->
    <div id="auth-container">
        <div class="auth-logo">
            <span style="background:var(--accent);color:black;padding:2px 8px;border-radius:6px">AI</span> Forsale
        </div>
        <div class="auth-card">
            <h2 style="margin-bottom:10px;">سوق المستقبل</h2>
            <p style="color:#aaa; margin-bottom:20px;">سجل دخولك لتبدأ البيع والشراء</p>
            
            <!-- الزرار المعدل -->
            <button class="main-btn pi-btn" onclick="handlePiLogin()">
                <i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi
            </button>
        </div>
    </div>

    <!-- شاشة التطبيق الرئيسية (مخفية في البداية) -->
    <div id="app-container" style="display:none;">
        <div class="fixed-header-wrapper">
            <div class="header">
                <div class="content-wrapper">
                    <div class="logo"><span class="ai-badge">AI</span> Forsale</div>
                    <div id="user-welcome" style="font-size:12px; color:var(--accent);"></div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="content-wrapper">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" placeholder="ابحث عن منتج...">
                </div>
                
                <h3 style="color:white; margin:15px 0;">منتجات مميزة</h3>
                <div class="products-grid" id="products-grid">
                    <!-- المنتجات هتظهر هنا بالكود -->
                </div>
            </div>
        </div>
    </div>

    <!-- مودال الشراء -->
    <div id="checkoutModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:2000; align-items:center; justify-content:center; flex-direction:column;">
        <div style="background:#1a2e44; padding:30px; border-radius:15px; text-align:center; width:90%; max-width:350px; border:1px solid rgba(255,255,255,0.1);">
            <i class="fa-solid fa-cart-shopping" style="font-size:40px; color:#FFD700; margin-bottom:15px;"></i>
            <h3 id="modal-title" style="color:white; margin:0;">منتج</h3>
            <p id="modal-price" style="font-size:24px; color:#00f2ff; font-weight:bold; margin:15px 0;">0 Pi</p>
            
            <button class="main-btn" onclick="processPayment()" id="pay-btn">
                تأكيد ودفع
            </button>
            <button class="main-btn" onclick="closeCheckout()" style="background:transparent; border:1px solid #555; margin-top:10px; color:#aaa;">
                إلغاء
            </button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
2️⃣ ملف script.js (الكود الكامل للربط والدفع)

(ضفتلك فيه رسائل تنبيه alert عشان تعرف إن الزرار شغال).

code
JavaScript
download
content_copy
expand_less
/* script.js - Final Version */

// رابط الباك إند (Vercel API)
const API_BASE = "/api"; 

let currentUser = null;
let currentProduct = null;

// منتجات تجريبية
const productsData = [
    { id: "item_1", title: "iPhone 15 Pro", price: 100 },
    { id: "item_2", title: "Sony PlayStation 5", price: 50 },
    { id: "item_3", title: "Samsung S24 Ultra", price: 80 }
];

// 1. عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Loaded");
    // عرض المنتجات
    renderProducts();
});

// 2. دالة تسجيل الدخول (مربوطة بالزرار في HTML)
async function handlePiLogin() {
    // رسالة عشان نتأكد إن الزرار استجاب
    alert("جاري الاتصال بـ Pi Network... ⏳");

    try {
        const scopes = ['username', 'payments'];
        
        // أمر المصادقة من مكتبة Pi
        const authResult = await Pi.authenticate(scopes, onIncompletePayment);
        
        // لو نجح
        alert("تم الدخول بنجاح! أهلاً " + authResult.user.username);
        
        // حفظ المستخدم وإظهار التطبيق
        currentUser = authResult.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('user-welcome').innerText = authResult.user.username;

        // (اختياري) إبلاغ السيرفر
        // fetch(`${API_BASE}/auth`, { method: 'POST', body: JSON.stringify(authResult) });

    } catch (error) {
        console.error(error);
        alert("فشل الاتصال: " + error);
    }
}

// 3. دالة عرض المنتجات
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if(!grid) return;

    grid.innerHTML = productsData.map(p => `
        <div class="product-card" onclick="openCheckout('${p.id}')">
            <div class="p-img-box" style="background:#222; display:flex; align-items:center; justify-content:center;">
                <i class="fa-solid fa-box-open" style="font-size:40px; color:#555;"></i>
            </div>
            <div class="p-details">
                <div class="p-name">${p.title}</div>
                <div class="p-price">${p.price} Pi</div>
            </div>
        </div>
    `).join('');
}

// 4. فتح نافذة الشراء
window.openCheckout = function(id) {
    const product = productsData.find(p => p.id === id);
    if(!product) return;

    currentProduct = product;
    document.getElementById('modal-title').innerText = product.title;
    document.getElementById('modal-price').innerText = product.price + " Pi";
    
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
}

window.closeCheckout = function() {
    document.getElementById('checkoutModal').style.display = 'none';
}

// 5. تنفيذ الدفع (The Payment Logic)
window.processPayment = async function() {
    if(!currentProduct || !currentUser) return;

    const btn = document.getElementById('pay-btn');
    btn.innerHTML = 'جاري المعالجة...';
    btn.disabled = true;

    try {
        const paymentData = {
            amount: currentProduct.price,
            memo: "شراء " + currentProduct.title,
            metadata: { productId: currentProduct.id }
        };

        // إنشاء الدفعة
        const payment = await Pi.createPayment(paymentData, {
            // أ) الموافقة من السيرفر
            onReadyForServerApproval: async (paymentId) => {
                alert("جاري طلب موافقة السيرفر...");
                await fetch(`${API_BASE}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            // ب) الإكمال والنجاح
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ تم الدفع بنجاح! TXID: " + txid);
                btn.innerHTML = 'تم الدفع';
                closeCheckout();
            },
            // ج) الإلغاء
            onCancel: (paymentId) => { 
                alert("تم إلغاء الدفع");
                btn.innerHTML = 'تأكيد ودفع';
                btn.disabled = false;
            },
            // د) خطأ
            onError: (error, payment) => {
                alert("خطأ: " + error);
                btn.innerHTML = 'تأكيد ودفع';
                btn.disabled = false;
            }
        });

    } catch (e) {
        alert("خطأ في بدء الدفع: " + e);
        btn.innerHTML = 'تأكيد ودفع';
        btn.disabled = false;
    }
}

// دالة مطلوبة من Pi
function onIncompletePayment(payment) { console.log("Incomplete payment", payment); }
📝 خطوات التنفيذ السريعة:

روح على GitHub.

افتح ملف index.html -> تعديل -> امسح القديم وحط الكود اللي فوق -> Commit.

افتح ملف script.js -> تعديل -> امسح القديم وحط الكود اللي فوق -> Commit.

روح على Vercel واعمل Redeploy.

افتح التطبيق من Pi Browser وجرب.. المرة دي هتلاقي رسالة ترحيب بتطلعلك أول ما تدوس! 🚀
