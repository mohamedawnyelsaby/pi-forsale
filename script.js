const API_BASE = "/api";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        Pi.init({ version: "2.0", sandbox: true });
    } catch (err) { console.error(err); }
});

async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        // دالة onIncomplete هي اللي هتحل المشكلة دي
        const auth = await Pi.authenticate(scopes, onIncompletePayment);
        
        currentUser = auth.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        alert(`أهلاً بك يا ${currentUser.username}`);
        
    } catch (err) {
        alert("فشل الدخول: " + err);
    }
}

// دي الدالة السحرية اللي بتعالج العمليات العالقة
function onIncompletePayment(payment) {
    console.log("Found incomplete payment:", payment);
    
    // محاولة إكمالها في السيرفر (لو كانت مدفوعة)
    fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.identifier })
    }).then(() => {
        alert("تم معالجة عملية عالقة سابقة بنجاح ✅");
    }).catch((e) => {
        console.log("Error handling incomplete:", e);
    });
}

async function startPayment() {
    if (!currentUser) return alert("سجل الدخول أولاً");

    try {
        const payment = await Pi.createPayment({
            amount: 1,
            memo: "شراء منتج - Forsale AI",
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
                // لو الخطأ هو "pending payment"، نقول للمستخدم الحل
                if (JSON.stringify(err).includes("pending payment")) {
                    alert("⚠️ هناك عملية دفع سابقة لم تكتمل. قم بتحديث الصفحة وانتظر قليلاً.");
                } else {
                    alert("خطأ: " + err);
                }
            }
        });
    } catch (err) {
        alert("خطأ: " + err);
    }
}
