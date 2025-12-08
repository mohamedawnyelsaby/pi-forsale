const API_BASE = "/api";
let currentUser = null;

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // محاولة تعريف Pi SDK
    try {
        Pi.init({ version: "2.0", sandbox: true });
    } catch (err) {
        console.error("Pi SDK Error:", err);
    }
});

// 1. دالة تسجيل الدخول (لزرار الدخول)
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncomplete);
        
        currentUser = auth.user;
        
        // إخفاء شاشة الدخول وإظهار التطبيق
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // رسالة ترحيب
        alert(`أهلاً بك يا ${currentUser.username} في Forsale AI`);
        
    } catch (err) {
        alert("فشل الدخول: تأكد أنك تستخدم Pi Browser.");
    }
}

// 2. دالة الشراء (لزرار الشراء)
async function startPayment() {
    if (!currentUser) {
        alert("يجب تسجيل الدخول أولاً!");
        return;
    }

    try {
        const payment = await Pi.createPayment({
            amount: 1, // سعر المنتج (تست)
            memo: "شراء منتج تجريبي - Forsale AI", 
            metadata: { type: "test_product" }
        }, {
            // Callback: الموافقة
            onReadyForServerApproval: async (paymentId) => {
                alert("جاري الاتصال بالسيرفر للموافقة...");
                const response = await fetch('/api/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
                
                if (!response.ok) throw new Error("فشل الموافقة من السيرفر");
            },
            // Callback: النجاح
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ تم الدفع بنجاح! شكراً لشرائك.");
            },
            // Callback: الإلغاء
            onCancel: () => alert("تم إلغاء العملية."),
            // Callback: الخطأ
            onError: (err) => alert("حدث خطأ: " + err)
        });
    } catch (err) {
        alert("خطأ في بدء الدفع: " + err);
    }
}

function onIncomplete(payment) { console.log(payment); }
