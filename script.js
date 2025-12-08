/* script.js */

const API_BASE = "/api"; 
let currentUser = null;

// منتج التفعيل
const products = [
    { 
        id: "activation_item_10", 
        title: "تفعيل الخطوة 10 (Test)", 
        price: 1.0, 
        icon: "fa-check-circle" 
    }
];

// 1. تشغيل التطبيق وعرض المنتجات
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});

// 2. تسجيل الدخول
async function handleLogin() {
    // رسالة عشان نتأكد إن الزرار شغال
    alert("جاري الاتصال بـ Pi Network... ⏳");

    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncomplete);
        
        currentUser = auth.user;
        
        // تغيير الواجهة
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username').innerText = "أهلاً: " + currentUser.username;

    } catch (err) {
        alert("فشل الدخول: " + err);
        console.error(err);
    }
}

// 3. عرض المنتجات
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="buyItem('${p.id}')">
            <div class="p-img-box">
                <i class="fa-solid ${p.icon}" style="font-size:40px; color:#FFD700;"></i>
            </div>
            <div class="p-details">
                <div class="p-name">${p.title}</div>
                <div class="p-price">${p.price} Pi</div>
                <button class="main-btn" style="margin-top:10px; font-size:12px;">شراء للتفعيل</button>
            </div>
        </div>
    `).join('');
}

// 4. عملية الدفع (الأهم لتفعيل الخطوة 10)
async function buyItem(id) {
    if(!currentUser) return alert("يجب تسجيل الدخول أولاً");

    const product = products.find(p => p.id === id);

    try {
        const payment = await Pi.createPayment({
            amount: product.price,
            memo: "تفعيل - Forsale AI",
            metadata: { type: "activation" }
        }, {
            // أ) الموافقة من السيرفر (Server Approval)
            onReadyForServerApproval: async (paymentId) => {
                alert("جاري طلب الموافقة من السيرفر...");
                await fetch(`${API_BASE}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            // ب) اكتمال العملية (Server Completion)
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ مبروك! تمت العملية بنجاح. الخطوة 10 اكتملت.");
            },
            // ج) إلغاء
            onCancel: () => alert("تم الإلغاء"),
            // د) خطأ
            onError: (error) => alert("خطأ: " + error)
        });

    } catch (e) {
        alert("خطأ في إنشاء الدفعة: " + e);
    }
}

function onIncomplete(p) { console.log(p); }
