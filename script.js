const API_BASE = "/api";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    try { Pi.init({ version: "2.0", sandbox: true }); } catch (e) {}
});

async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        // هنا السر: أي عملية عالقة هتروح لدالة onIncompletePayment
        const auth = await Pi.authenticate(scopes, onIncompletePayment);
        
        currentUser = auth.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = auth.user.username;
        
    } catch (err) {
        alert("فشل الدخول: " + err);
    }
}

// دالة التنظيف الإجباري
function onIncompletePayment(payment) {
    // تنبيه للمستخدم
    alert(`⚠️ تم كشف عملية عالقة (${payment.identifier}). جاري حذفها...`);
    
    // استدعاء ملف الممحاة
    fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.identifier })
    })
    .then(() => {
        alert("✅ تم تنظيف العملية العالقة! اضغط على زر الشراء الآن.");
    })
    .catch(e => alert("خطأ في التنظيف: " + e));
}

async function startPayment() {
    if (!currentUser) return alert("سجل الدخول أولاً");

    try {
        const payment = await Pi.createPayment({
            amount: 1,
            memo: "شراء جديد - Forsale AI",
            metadata: { type: "test" }
        }, {
            onReadyForServerApproval: async (paymentId) => {
                await fetch('/api/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId })
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                alert("✅ مبروك! تم الدفع بنجاح.");
            },
            onCancel: () => alert("تم الإلغاء"),
            onError: (err) => {
                // لو ظهر الخطأ تاني، نطلب من المستخدم يعمل ريفرش
                alert("♻️ خطأ: " + err + " -> قم بتحديث الصفحة وحاول مرة أخرى.");
            }
        });
    } catch (err) {
        alert("خطأ: " + err);
    }
}
