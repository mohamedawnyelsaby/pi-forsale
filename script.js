/* script.js - Production Version */

const API_BASE = "/api";
let currentUser = null;

const products = [
    { id: "iphone15", title: "iPhone 15 Pro", price: 350, img: "https://via.placeholder.com/150" },
    { id: "ps5", title: "PlayStation 5", price: 120, img: "https://via.placeholder.com/150" }
];

document.addEventListener('DOMContentLoaded', () => {
    // إخفاء التحميل
    const loader = document.getElementById('loading');
    if(loader) loader.style.display = 'none';
    renderProducts();
});

// 1. تسجيل الدخول
async function handleLogin() {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncomplete);
        currentUser = auth.user;
        
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = currentUser.username;
    } catch (err) {
        alert("فشل الدخول: " + err);
    }
}

// 2. عرض المنتجات
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if(!grid) return;
    
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="buyProduct('${p.id}')" style="background:rgba(255,255,255,0.1); padding:15px; border-radius:10px; margin:10px;">
            <h3>${p.title}</h3>
            <p style="color:#FFD700; font-weight:bold;">${p.price} Pi</p>
            <button class="main-btn" style="width:100%; margin-top:5px;">شراء</button>
        </div>
    `).join('');
}

// 3. الدفع
async function buyProduct(id) {
    if(!currentUser) return;
    const product = products.find(p => p.id === id);

    try {
        const payment = await Pi.createPayment({
            amount: product.price,
            memo: `شراء ${product.title}`,
            metadata: { productId: product.id }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                await fetch(`${API_BASE}/approve`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ تم الشراء بنجاح!");
            },
            onCancel: () => alert("تم الإلغاء"),
            onError: (e) => alert("خطأ: " + e)
        });
    } catch (e) {
        alert("خطأ: " + e);
    }
}

function onIncomplete(p) { console.log(p); }
