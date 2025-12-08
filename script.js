// ===========================================
// بيانات محاكاة محلية
// ============================================
let currentUser = null;
const users = JSON.parse(localStorage.getItem('forsale_users')) || [];
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;
// محاكاة للإشعارات
let logyMsgs = [
    { s: 'ai', t: 'مرحباً بك! أنا Logy AI، مساعدك الشخصي في Forsale. كيف يمكنني خدمتك اليوم؟\nيمكنك أن تطلب مني البحث، أو تحليل منتج، أو مراجعة طلباتك.' }
];

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
    { id: 4, name: 'خادم سحابي سريع', price: 10.00, pi_price: 3, category: 'hosting', sub: 'vps', rating: 4.6, sold: 88, description: 'خادم افتراضي خاص بأداء عالٍ.' },
    { id: 5, name: 'محلل بيانات الذكاء الاصطناعي', price: 75.00, pi_price: 22, category: 'ai', sub: 'analysis', rating: 4.7, sold: 60, description: 'تحليل معمق للبيانات وتقديم تقارير ذكية.' },
];
// ============================================
// وظائف تسجيل الدخول
// ============================================
function checkLoginStatus() {
    currentUser = JSON.parse(localStorage.getItem('forsale_current_user'));
    if (currentUser) {
        showApp();
    } else {
        // يتم تعيين display: flex هنا كحالة افتراضية
        document.getElementById('auth-container').style.display = 'flex';
    }
}

/**
 * @description وظيفة إظهار التطبيق الرئيسي وإغلاق جميع النوافذ المنبثقة.
 * 🚨 Fix: تم إضافة closeAllModals() لضمان عمل شريط التنقل السفلي.
 */
function showApp(sectionId = 'home') {
    closeAllModals();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';

    // Show selected section and activate nav item
    document.querySelectorAll('.app-content-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });

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

function setupLogin() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
}

function login() {
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
    
    // تسجيل الدخول مباشرة بعد التسجيل
    currentUser = newUser;
    localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
    showApp('home');
}

function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.querySelector('.auth-card:first-child').style.display = 'block';
}

function showRegisterForm() {
    document.querySelector('.auth-card:first-child').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function logout() {
    localStorage.removeItem('forsale_current_user');
    currentUser = null;
    window.location.reload();
}

// ============================================
// وظائف Pi Payment (الخطوة 10)
// ============================================

/**
 * تبدأ عملية دفع جديدة عبر Pi Network.
 * @param {number} amount - المبلغ المراد دفعه (بوحدة Pi).
 * @param {string} memo - مذكرة المعاملة (وصف قصير).
 */
function initiatePiPayment(amount, memo) {
    // التحقق من وجود كائن Pi (أي أن التطبيق يعمل داخل متصفح Pi)
    if (!window.Pi) {
        alert("خطأ: Pi SDK غير متاح. يرجى تشغيل التطبيق داخل متصفح Pi (Pi Browser) لأداء الدفع.");
        console.error("Pi SDK is not available.");
        return;
    }
    
    // **تنبيه للمطور:** في تطبيق حقيقي، يجب أن ترسل "onReadyForServerApproval"
    // و "onReadyForServerCompletion" إلى خادم آمن ليقوم بمعالجتها باستخدام مفتاحك السري.
    // هذا الجزء هو كود العميل فقط.

    const paymentData = {
        amount: amount,
        memo: memo,
        metadata: {
            appId: 'forsale-ai', // معرف التطبيق الخاص بك
            test: true // وضع الاختبار
        },
        
        // 1. **إذن الخادم (Server Approval)**
        onReadyForServerApproval: (paymentId) => {
            // **هنا يجب أن يتم إرسال (paymentId) إلى الخادم عبر AJAX/Fetch**
            console.log(`Payment Ready for Server Approval: ${paymentId}`);
            alert(`✅ تم إنشاء المعاملة بنجاح (ID: ${paymentId}).\n\nتنبيه هام: يجب على الخادم الخاص بك إعطاء الإذن للدفع لكي تستمر العملية. (كود العميل لا يمكنه القيام بذلك).`);
        },
        
        // 2. **إكمال الخادم (Server Completion)**
        onReadyForServerCompletion: (paymentId, txid) => {
            // **هنا يجب أن يتم إرسال (paymentId) و (txid) إلى الخادم للتحقق النهائي**
            console.log(`Payment Ready for Server Completion: ${paymentId}, TxID: ${txid}`);
            
            // محاكاة إكمال ناجح في التطبيق الثابت
            showSuccessNotification(`تمت معالجة المعاملة بنجاح! TxID: ${txid}`, 5000);
            
            // **تحديث رصيد المستخدم (محاكاة)**
            if(currentUser) {
                currentUser.balance -= amount;
                updateBalanceDisplay();
            }
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

    // إنشاء كائن الدفع وبدء العملية
    window.Pi.createPayment(paymentData);
}

// دالة مساعدة لعرض إشعار النجاح
function showSuccessNotification(message, duration = 3000) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 70px; /* فوق شريط التنقل */
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--success-color);
        color: white;
        padding: 10px 20px;
        border-radius: var(--radius);
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.remove();
    }, duration);
}

// ============================================
// وظائف عرض المحتوى (Rendering)
// ============================================
function updateBalanceDisplay() {
    if (currentUser) {
        document.getElementById('user-balance').textContent = `${currentUser.balance.toFixed(2)} Pi`;
        document.getElementById('profile-username-display').textContent = currentUser.username;
        document.getElementById('profile-email-display').textContent = currentUser.email;
    }
}

function renderCategories() {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;
    filterContainer.innerHTML = '';
    
    categories.forEach(cat => {
        const catItem = document.createElement('div');
        catItem.classList.add('cat-item');
        if (cat.id === activeCategory) {
            catItem.classList.add('active');
        }
        catItem.innerHTML = `<i class="fa-solid ${cat.icon}"></i> <span>${cat.name}</span>`;
        catItem.setAttribute('onclick', `selectCategory('${cat.id}', this)`);
        filterContainer.appendChild(catItem);
    });
}

function selectCategory(categoryId, element) {
    document.querySelectorAll('.cat-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    activeCategory = categoryId;
    renderProducts();
}

function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '';

    const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.setAttribute('onclick', `alert('جاري عرض تفاصيل المنتج: ${product.name}')`);
        productCard.innerHTML = `
            <div class="product-header">
                <span class="product-category">${categories.find(c => c.id === product.category).name}</span>
                <span class="product-rating"><i class="fa-solid fa-star"></i> ${product.rating}</span>
            </div>
            <h4 class="product-title">${product.name}</h4>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">${product.pi_price} Pi <small>($${product.price.toFixed(2)})</small></span>
                <button class="buy-btn" onclick="event.stopPropagation(); alert('جاري إضافة ${product.name} إلى السلة.')">شراء</button>
            </div>
        `;
        productList.appendChild(productCard);
    });
}

// ============================================
// وظائف النوافذ المنبثقة (Modals)
// ============================================

function closeAllModals() {
    ['logyAiModal', 'notificationsModal', 'profileModal', 'ordersModal', 'depositModal', 'withdrawalModal', 'sellerDashboardModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

window.openLogyAiModal = () => { closeAllModals(); document.getElementById('logyAiModal').style.display = 'flex'; document.body.style.overflow = 'hidden'; };
window.closeLogyAiModal = () => { document.getElementById('logyAiModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openNotificationsModal = () => { closeAllModals(); document.getElementById('notificationsModal').style.display = 'block'; document.body.style.overflow = 'hidden'; updateNotificationDot(true); };
window.closeNotificationsModal = () => { document.getElementById('notificationsModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openProfileModal = () => { closeAllModals(); document.getElementById('profileModal').style.display = 'block'; document.body.style.overflow = 'hidden'; };
window.closeProfileModal = () => { document.getElementById('profileModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openOrdersModal = () => { closeAllModals(); document.getElementById('ordersModal').style.display = 'block'; document.body.style.overflow = 'hidden'; };
window.closeOrdersModal = () => { document.getElementById('ordersModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openDepositModal = () => { closeAllModals(); document.getElementById('depositModal').style.display = 'block'; document.body.style.overflow = 'hidden'; };
window.closeDepositModal = () => { document.getElementById('depositModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openWithdrawalModal = () => { closeAllModals(); document.getElementById('withdrawalModal').style.display = 'block'; document.body.style.overflow = 'hidden'; };
window.closeWithdrawalModal = () => { document.getElementById('withdrawalModal').style.display = 'none'; document.body.style.overflow = ''; };

window.openSellerDashboardModal = () => {
    closeAllModals();
    document.getElementById('sellerDashboardModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
};
window.closeSellerDashboardModal = () => {
    document.getElementById('sellerDashboardModal').style.display = 'none';
    document.body.style.overflow = '';
};
function viewListingDetails(productId) {
    alert(`جاري عرض تفاصيل المنتج: ${productId}\n(هنا يتم فتح صفحة تفاصيل المنتج مع خيارات التعديل للبائع).`);
}

function viewOrderShipment(orderId) {
    alert(`جاري عرض تفاصيل الطلب: ${orderId}\n(هنا يتم فتح صفحة تتبع الطلب وخيارات الشحن).`);
}

// ============================================
// وظائف محاكاة (لـ Deposit/Withdrawal)
// ============================================

function simulateDeposit() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    if (isNaN(amount) || amount <= 0) {
        alert("يرجى إدخال مبلغ صحيح.");
        return;
    }
    if (currentUser) {
        currentUser.balance += amount;
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        updateBalanceDisplay();
        closeDepositModal();
        showSuccessNotification(`تم إيداع ${amount.toFixed(2)} Pi بنجاح (محاكاة).`);
    }
}

function simulateWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawal-amount').value);
    const address = document.getElementById('withdrawal-address').value;
    
    if (isNaN(amount) || amount <= 0 || amount > currentUser.balance) {
        alert("مبلغ السحب غير صحيح أو يتجاوز الرصيد المتاح.");
        return;
    }
    if (!address) {
        alert("يرجى إدخال عنوان محفظة Pi.");
        return;
    }
    
    if (currentUser) {
        currentUser.balance -= amount;
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        updateBalanceDisplay();
        closeWithdrawalModal();
        showSuccessNotification(`تم سحب ${amount.toFixed(2)} Pi إلى ${address.substring(0, 10)}... (محاكاة).`);
    }
}

// ============================================
// وظائف Logy AI Chat
// ============================================

function renderMessages() {
    const chatArea = document.getElementById('logy-chat-area');
    if (!chatArea) return;
    chatArea.innerHTML = logyMsgs.map(msg => `
        <div class="chat-message ${msg.s === 'ai' ? 'ai-message' : 'user-message'}">
            ${msg.t.replace(/\n/g, '<br>')}
        </div>
    `).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const userText = input.value.trim();
    if (userText === '') return;

    // 1. إضافة رسالة المستخدم
    logyMsgs.push({ s: 'user', t: userText });
    renderMessages();

    // 2. محاكاة رد AI
    input.value = '';
    
    setTimeout(() => {
        const aiResponse = `لقد تلقيت سؤالك: "${userText}".\n\nبصفتي Logy AI، أنا أعمل على تحليل استفسارك وتقديم أفضل إجابة من قاعدة بيانات Forsale.`;
        logyMsgs.push({ s: 'ai', t: aiResponse });
        renderMessages();
    }, 1000);
}

// ============================================
// وظائف الإشعارات
// ============================================

function updateNotificationDot(read = false) {
    const dot = document.getElementById('notification-dot');
    if (!dot) return;

    if (read) {
        unreadNotifications = 0;
    }

    if (unreadNotifications > 0) {
        dot.style.display = 'block';
        dot.textContent = unreadNotifications;
    } else {
        dot.style.display = 'none';
    }
}


// ============================================
// تهيئة التطبيق الرئيسي
// ============================================

function initializeApp() {
    renderCategories();
    renderProducts();
    updateBalanceDisplay(); // تحديث الرصيد عند بدء التطبيق
    selectCategory('all', document.querySelector('.cat-item')); // Select 'الكل' initially
    updateNotificationDot();
    renderMessages(); // لضمان ظهور رسالة AI الترحيبية
    
    // **ربط زر الدفع (الخطوة 10)**
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
    checkLoginStatus(); // التحقق من حالة الدخول
    
    // إصلاح زر Enter في الدردشة (Logy AI Chat)
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
