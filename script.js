const API_BASE = "/api";
let currentUser = null;

// 1. التشغيل
document.addEventListener('DOMContentLoaded', () => {
    try {
        // بنشيل sandbox عشان نكون في الوضع الصارم
        Pi.init({ version: "2.0", sandbox: true });
        // بننادي على الدخول فوراً عشان نكتشف الأخطاء
        handlePiLogin();
    } catch (e) { console.error(e); }
});

// 2. دالة الدخول واكتشاف الأخطاء
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        
        // onIncompletePayment: دي الدالة اللي هتمسك العملية المحشورة
        const auth = await Pi.authenticate(scopes, onIncompletePayment);
        
        currentUser = auth.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('username-display').innerText = auth.user.username;
        
    } catch (err) {
        console.log("Login check done.");
    }
}

// 3. دالة التنظيف (هتشتغل لوحدها لو فيه مشكلة)
function onIncompletePayment(payment) {
    // إظهار تنبيه للمستخدم
    alert(`⚠️ تم كشف عملية عالقة! جاري حذفها الآن... ID: ${payment.identifier}`);
    
    // إرسالها للسيرفر للإلغاء
    fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.identifier })
    })
    .then(res => res.json())
    .then(data => {
        alert("✅ تم تنظيف العملية بنجاح! جرب الشراء الآن.");
        // إعادة تحميل الصفحة عشان نبدأ على نضيف
        location.reload(); 
    })
    .catch(e => alert("فشل التنظيف: " + e));
}

// 4. دالة الشراء الجديدة
async function startPayment() {
    if (!currentUser) return alert("انتظر تحميل البيانات...");

    try {
        const payment = await Pi.createPayment({
            amount: 1,
            memo: "New Order",
            metadata: { type: "test" }
        }, {
            onReadyForServerApproval: (paymentId) => { alert("Payment ID generated: " + paymentId); },
            onReadyForServerCompletion: (paymentId, txid) => { alert("Done! TXID: " + txid); },
            onCancel: () => { alert("Cancelled"); },
            onError: (err) => { 
                // لو الخطأ ظهر تاني، يبقى لسه بتتحذف
                alert("خطأ: " + JSON.stringify(err));
                if(JSON.stringify(err).includes("pending")) {
                    location.reload(); // ريفرش عشان يلقطها وينضفها
                }
            }
        });
    } catch (err) {
        alert("Start Error: " + err);
    }
}
