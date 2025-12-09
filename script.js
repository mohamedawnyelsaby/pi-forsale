// ============================================
// ملف: script.js (النسخة النهائية مع حل مشكلة التعليق)
// ============================================

const Pi = window.Pi;
let currentUser = null;

// 1. التهيئة عند فتح التطبيق
document.addEventListener('DOMContentLoaded', () => {
    // تعريف الدالة المطلوبة للتعامل مع الدفعات غير المكتملة
    // (يجب تعريفها قبل أي عملية مصادقة)
    function onIncompletePayment(payment) {
        console.log("Incomplete Payment found", payment);
        // يمكنك إضافة كود هنا لإرسال الدفعة للسيرفر إذا لزم الأمر
    }

    try {
        // تهيئة الشبكة
        Pi.init({ version: "2.0", sandbox: true }); 
        console.log("Pi SDK Initialized");

        // ربط الأزرار
        const loginBtn = document.getElementById('pi-login-btn');
        const payBtn = document.getElementById('pay-btn');

        if(loginBtn) loginBtn.addEventListener('click', () => loginUser(onIncompletePayment));
        if(payBtn) payBtn.addEventListener('click', startPayment);

    } catch (err) {
        alert("خطأ في تهيئة Pi SDK: " + err);
    }
});

// 2. وظيفة تسجيل الدخول (مع مؤقت لحل مشكلة التعليق)
async function loginUser(onIncompleteCallback) {
    const statusMsg = document.getElementById('status-msg');
    statusMsg.style.color = "yellow";
    statusMsg.innerText = "جاري الاتصال... تأكد أن الرابط مطابق لبوابة المطورين";
    
    // إنشاء مؤقت مدته 10 ثواني
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("انتهت المهلة! الاتصال استغرق وقتاً طويلاً. تأكد من أن رابط التطبيق في Developer Portal هو: https://pi-forsale.vercel.app")), 10000)
    );

    try {
        // محاولة المصادقة (تتسابق مع المؤقت)
        const authPromise = Pi.authenticate(['username', 'payments'], onIncompleteCallback);
        const authResult = await Promise.race([authPromise, timeoutPromise]);
        
        // نجاح الدخول
        console.log("Auth Success", authResult);
        currentUser = authResult.user;
        
        // إخفاء شاشة الدخول وإظهار شاشة الدفع
        document.getElementById('username-display').innerText = currentUser.username;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('shop-screen').style.display = 'block';

    } catch (error) {
        // فشل الدخول
        console.error("Login Failed", error);
        statusMsg.style.color = "red";
        statusMsg.innerText = "فشل الدخول. اقرأ الرسالة أعلاه.";
        alert("خطأ في الدخول:\n" + error.message);
    }
}

// 3. وظيفة الشراء (لتفعيل الخطوة 10)
function startPayment() {
    if (!currentUser) {
        alert("يجب تسجيل الدخول أولاً.");
        return;
    }

    // بيانات الدفع (1 Pi للتجربة)
    const paymentData = {
        amount: 1, 
        memo: "تفعيل الخطوة 10 - دفعة تجريبية", 
        metadata: { type: "test_activation" } 
    };

    const callbacks = {
        onReadyForServerApproval: function(paymentId) {
            // وصولك لهذه النقطة يعني أن الخطوة 10 قيد التفعيل
            console.log("Payment ID:", paymentId);
            alert("تم بنجاح! تم إنشاء عملية الدفع.\nPayment ID: " + paymentId + "\n\n(هذا يؤكد أن التطبيق متصل بالمحفظة).");
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            console.log("TXID:", txid);
            alert("تمت العملية بالكامل! TXID: " + txid);
        },
        onCancel: function(paymentId) {
            alert("تم إلغاء الدفع من قبلك.");
        },
        onError: function(error, payment) {
            alert("حدث خطأ أثناء الدفع: " + error.message);
        }
    };

    try {
        Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        alert("فشل إنشاء الدفعة: " + err);
    }
}
