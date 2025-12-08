// ===========================================
// بيانات محاكاة محلية
// ============================================
let currentUser = null;
const users = JSON.parse(localStorage.getItem('forsale_users')) || [];
let activeCategory = 'all';
let logyMsgs = [
    { s: 'ai', t: 'مرحباً بك! أنا Logy AI، مساعدك الشخصي في Forsale. كيف يمكنني خدمتك اليوم؟\nيمكنك أن تطلب مني البحث، أو تحليل منتج، أو مراجعة طلباتك.' }
];

// ... (باقي تعريفات البيانات الوهمية - Categories, Products) ...

const categories = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group' },
    { id: 'ai', name: 'خدمات الذكاء الاصطناعي', icon: 'fa-robot' },
    { id: 'dev', name: 'تطوير البرمجيات', icon: 'fa-code' },
    { id: 'design', name: 'التصميم الجرافيكي', icon: 'fa-pencil-ruler' },
    { id: 'hosting', name: 'استضافة الويب', icon: 'fa-server' }
];

const products = [
    { id: 1, name: 'Logy AI Chatbot', price: 50.00, pi_price: 15, category: 'ai', sub: 'chatbot', rating: 4.8, sold: 120, description: 'بوت محادثة متطور مدعوم بنماذج اللغة الكبيرة.' },
    { id: 2, name: 'تطوير موقع احترافي', price: 300.00, pi_price: 90, category: 'dev', sub: 'web', rating: 4.5, sold: 45, description: 'تصميم وبرمجة موقع ويب متكامل بتقنيات حديثة.' },
    { id: 3, name: 'تصميم شعار احترافي', price: 40.00, pi_price: 12, category: 'design', sub: 'logo', rating: 4.9, sold: 210, description: 'شعار فريد يعكس هوية علامتك التجارية.' },
];


// ============================================
// وظائف تسجيل الدخول (بقية الكود تبقى كما هي)
// ============================================
function checkLoginStatus() {
    currentUser = JSON.parse(localStorage.getItem('forsale_current_user'));
    if (currentUser) {
        showApp('home');
    } else {
        document.getElementById('auth-container').style.display = 'flex';
    }
}

function showApp(sectionId = 'home') {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';

    document.querySelectorAll('.app-content-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

    // ... (بقية منطق تنشيط شريط التنقل) ...
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        const clickHandler = item.getAttribute('onclick');
        if (clickHandler && clickHandler.includes(`showApp('${sectionId}')`)) {
             item.classList.add('active');
        } else if (sectionId === 'home' && clickHandler.includes(`showApp('home')`)) {
             item.classList.add('active');
        }
    });

    initializeApp();
}

function login() {
    // ... (منطق تسجيل الدخول) ...
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        showApp('home');
    } else {
        alert('فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.');
    }
}
function register() {
    // ... (منطق التسجيل) ...
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (users.some(u => u.email === email)) {
        alert('هذا البريد الإلكتروني مسجل بالفعل.');
        return;
    }

    const newUser = {
        id: users.length + 1,
        username: username,
        email: email,
        password: password,
        balance: 100 // رصيد افتراضي للمحاكاة
    };

    users.push(newUser);
    localStorage.setItem('forsale_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
    showApp('home');
}
function logout() {
    localStorage.removeItem('forsale_current_user');
    currentUser = null;
    window.location.reload();
}


// ============================================
// وظائف Pi Payment (المنطق المُعدل لربط الخادم)
// ============================================
function initiatePiPayment(amount, memo) {
    if (!window.Pi) {
        alert("خطأ: Pi SDK غير متاح. يرجى تشغيل التطبيق داخل متصفح Pi.");
        return;
    }

    const paymentData = {
        amount: amount,
        memo: memo,
        metadata: {
            appId: 'forsale-ai', 
            test: true 
        },
        
        // 1. **إذن الخادم (Server Approval): يتصل الآن بالخادم الجديد**
        onReadyForServerApproval: (paymentId) => {
            console.log(`Payment Ready for Server Approval: ${paymentId}`);
            
            // **إرسال طلب إلى الخادم الخلفي (المسار الآمن)**
            fetch('/api/payments/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    // إذا فشل الخادم في الموافقة، يمكن إلغاء الدفع هنا
                    console.error('Server Failed to Approve:', data.error);
                } else {
                    console.log('Server Approved:', data.message);
                }
            })
            .catch(error => {
                console.error('Fetch Error to approve:', error);
                alert('خطأ في الاتصال بالخادم لمنح الإذن.');
            });
        },
        
        // 2. **إكمال الخادم (Server Completion): يتصل الآن بالخادم الجديد**
        onReadyForServerCompletion: (paymentId, txid) => {
            console.log(`Payment Ready for Server Completion: ${paymentId}, TxID: ${txid}`);
            
            // **إرسال طلب إلى الخادم الخلفي لإكمال المعاملة رسمياً**
            fetch('/api/payments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, txid: txid })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessNotification(`تمت معالجة المعاملة بنجاح! TxID: ${txid}`, 5000);
                    // تحديث محاكاة رصيد المستخدم
                    if(currentUser) {
                        currentUser.balance -= amount;
                        updateBalanceDisplay();
                    }
                } else {
                     alert('فشل الخادم في إكمال المعاملة. يرجى مراجعة سجلات الخادم.');
                }
            })
            .catch(error => {
                console.error('Fetch Error to complete:', error);
                alert('خطأ في الاتصال بالخادم لإكمال المعاملة.');
            });
        },
        
        onCancel: (paymentId) => {
            console.log(`Payment Canceled: ${paymentId}`);
            alert('تم إلغاء عملية الدفع من قبل المستخدم.');
        },
        
        onError: (error, paymentId) => {
            console.error(`Payment Error: ${error.message || error.toString()}, ID: ${paymentId}`);
            alert(`حدث خطأ أثناء الدفع: ${error.message || error.toString()}`);
        }
    };

    window.Pi.createPayment(paymentData);
}

// ... (بقية الدوال المساعدة، مثل showSuccessNotification، updateBalanceDisplay، renderProducts، إلخ تبقى كما هي) ...

// ============================================
// تهيئة التطبيق الرئيسي
// ============================================

function initializeApp() {
    // ... (بقية منطق التهيئة) ...
    
    // **ربط زر الدفع**
    const testPaymentBtn = document.getElementById('testPiPaymentBtn');
    if (testPaymentBtn) {
        testPaymentBtn.addEventListener('click', () => {
            // تنفيذ الدفع التجريبي بقيمة 1 Pi
            initiatePiPayment(1, "Test payment for Forsale AI app.");
        });
    }
}

// ============================================
// تهيئة الصفحة عند التحميل
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupLogin();
    // **تفعيل التحقق من الدخول لفتح التطبيق**
    checkLoginStatus(); 
    
    // **إصلاح زر Enter في الدردشة**
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
