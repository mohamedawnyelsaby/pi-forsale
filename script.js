const API_BASE = "/api";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    try { Pi.init({ version: "2.0", sandbox: true }); } catch (e) { }
});

async function handlePiLogin() {
    alert("جاري البحث عن عمليات معلقة...");
    try {
        const scopes = ['username', 'payments'];
        // هنا السر: onIncompletePayment هي اللي بتمسك العملية المحشورة
        const auth = await Pi.authenticate(scopes, onIncompletePayment);
        
        currentUser = auth.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = auth.user.username;
        
    } catch (err) {
        alert("خطأ: " + err);
    }
}

// دالة التنظيف
function onIncompletePayment(payment) {
    alert("⚠️ تم العثور على عملية معلقة! جاري إصلاحها...");
    
    fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.identifier })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert("✅ تم تنظيف العملية المعلقة بنجاح! يمكنك الشراء الآن.");
        } else {
            alert("❌ فشل التنظيف، حاول مرة أخرى.");
        }
    })
    .catch(e => alert("خطأ في الاتصال: " + e));
}

async function startPayment() {
    if (!currentUser) return alert("سجل الدخول أولاً");

    try {
        const payment = await Pi.createPayment({
            amount: 1,
            memo: "شراء منتج جديد",
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
                alert("✅ تم الدفع بنجاح!");
            },
            onCancel: () => alert("تم الإلغاء"),
            onError: (err) => {
                // لو قالك لسه فيه عملية معلقة، يبقى محتاج ريفرش
                alert("خطأ: " + JSON.stringify(err));
            }
        });
    } catch (err) {
        alert("خطأ: " + err);
    }
}
