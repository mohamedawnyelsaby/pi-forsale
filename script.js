const API_BASE = "/api"; 
let currentUser = null;

// منتجات تجريبية للعرض
const products = [
    { id: "item1", name: "iPhone 15 Pro", price: 50, img: "https://via.placeholder.com/150" },
    { id: "item2", name: "PS5 Console", price: 20, img: "https://via.placeholder.com/150" }
];

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل زر الدخول
    document.getElementById('login-btn').onclick = authenticate;
});

// 1. الدخول
async function authenticate() {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncomplete);
        
        // إرسال البيانات للسيرفر للتحقق (اختياري في البداية)
        currentUser = auth.user;
        
        // فتح التطبيق
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = "أهلاً " + auth.user.username;
        
        renderProducts();
    } catch (err) {
        alert("يرجى فتح الموقع من متصفح Pi Browser");
    }
}

// 2. عرض المنتجات
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(p => `
        <div class="product-card" style="background:#222; padding:15px; border-radius:10px; margin-bottom:10px;">
            <img src="${p.img}" style="width:100%; border-radius:10px;">
            <h3>${p.name}</h3>
            <p style="color:#FFD700; font-weight:bold;">${p.price} Pi</p>
            <button class="main-btn" onclick="buyItem('${p.id}', ${p.price})">شراء الآن</button>
        </div>
    `).join('');
}

// 3. الشراء الحقيقي
async function buyItem(id, price) {
    try {
        const payment = await Pi.createPayment({
            amount: price,
            memo: "شراء منتج رقم " + id,
            metadata: { productId: id }
        }, {
            // لما Pi يطلب موافقة السيرفر
            onReadyForServerApproval: async (paymentId) => {
                await fetch(`${API_BASE}/approve`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ paymentId })
                });
            },
            // لما العملية تنجح
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("مبروك! تم الدفع بنجاح.");
            },
            onCancel: () => alert("تم إلغاء العملية"),
            onError: (err) => alert("حدث خطأ: " + err)
        });
    } catch(e) {
        console.error(e);
    }
}

function onIncomplete(payment) { console.log(payment); }
