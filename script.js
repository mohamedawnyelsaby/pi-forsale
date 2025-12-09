// تعريف المتغيرات
const Pi = window.Pi;
let currentUser = null;

// 1. تهيئة الشبكة فور فتح التطبيق
document.addEventListener('DOMContentLoaded', () => {
    try {
        // sandbox: true تعني التجربة (Testnet).
        // إذا كنت تريد الدفع الحقيقي (Mainnet) اجعلها false
        Pi.init({ version: "2.0", sandbox: true });
        console.log("Pi SDK Initialized");
    } catch (err) {
        alert("Error initializing Pi SDK: " + err);
    }

    // ربط الأزرار بالوظائف
    document.getElementById('pi-login-btn').addEventListener('click', loginUser);
    document.getElementById('pay-btn').addEventListener('click', startPayment);
});

// 2. وظيفة تسجيل الدخول
async function loginUser() {
    const statusMsg = document.getElementById('status-msg');
    statusMsg.innerText = "Connecting to Pi Network...";
    
    try {
        // طلب المصادقة
        const authResult = await Pi.authenticate(['username', 'payments'], onIncompletePayment);
        
        // نجاح الدخول
        console.log("Auth Success", authResult);
        currentUser = authResult.user;
        
        // تبديل الشاشة
        document.getElementById('username-display').innerText = currentUser.username;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('shop-screen').style.display = 'block';

    } catch (error) {
        // فشل الدخول - إظهار السبب للمستخدم
        console.error("Login Failed", error);
        statusMsg.innerText = "Login Failed! See Alert.";
        alert("Login Error: " + error + "\n\nMake sure your URL matches the Pi Developer Portal exactly.");
    }
}

// 3. وظيفة الشراء (تفعيل الخطوة 10)
function startPayment() {
    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    // بيانات الدفع
    const paymentData = {
        amount: 1, // المبلغ 1 Pi (تجريبي)
        memo: "Test Transaction for Step 10", 
        metadata: { orderId: "12345" } 
    };

    const callbacks = {
        onReadyForServerApproval: function(paymentId) {
            // بمجرد وصولك هنا، الخطوة 10 تفعلت نظرياً لأنك أنشأت الدفعة
            console.log("Payment ID:", paymentId);
            alert("Success! Payment Initiated.\nPayment ID: " + paymentId + "\n\n(Note: Step 10 should now be active/pending in the portal).");
        },
        onReadyForServerCompletion: function(paymentId, txid) {
            console.log("TXID:", txid);
            alert("Transaction Complete! TXID: " + txid);
        },
        onCancel: function(paymentId) {
            console.log("Cancelled", paymentId);
            alert("Payment Cancelled by user.");
        },
        onError: function(error, payment) {
            console.error("Payment Error", error);
            alert("Payment Error: " + error.message);
        }
    };

    try {
        Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        alert("Payment Create Error: " + err);
    }
}

// 4. دالة مطلوبة من Pi SDK (حتى لو كانت فارغة)
function onIncompletePayment(payment) {
    console.log("Incomplete Payment found", payment);
    // يمكن تركها فارغة للتجربة، لكن وجودها ضروري لعمل المصادقة
}
