const API_BASE = "/api";
let currentUser = null;

// 1. التهيئة (نفس الطريقة اللي نجحت)
document.addEventListener('DOMContentLoaded', () => {
    try {
        // بنستخدم sandbox: true عشان ده رصيد وهمي (Testnet)
        // لو واجهت مشكلة غيرها لـ false زي المرة اللي فاتت
        Pi.init({ version: "2.0", sandbox: true });
        console.log("Pi SDK Initialized");
    } catch (err) {
        console.error(err);
    }
});

// 2. الدخول
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncomplete);
        
        currentUser = auth.user;
        
        // إظهار التطبيق
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = "أهلاً: " + auth.user.username;
        
        alert("تم الدخول! اضغط الآن على زر الشراء.");

    } catch (err) {
        alert("فشل الدخول: " + err);
    }
}

// 3. الشراء (عشان الخطوة 10)
async function startPayment() {
    if (!currentUser) return alert("يجب تسجيل الدخول");

    try {
        const payment = await Pi.createPayment({
            amount: 1,
            memo: "تفعيل المتجر - Forsale AI",
            metadata: { type: "test" }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                // إرسال للسيرفر للموافقة
                await fetch('/api/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ مبروك! تمت العملية بنجاح.");
            },
            onCancel: () => alert("تم الإلغاء"),
            onError: (e) => alert("خطأ: " + e)
        });
    } catch (e) {
        alert("خطأ: " + e);
    }
}

function onIncomplete(p) { console.log(p); }
