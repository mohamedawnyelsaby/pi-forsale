// ============================================
// 🤖 Forsale AI - Complete Frontend Logic
// ============================================

// 🔒 Environment Detection
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';

// 🔧 Safe Logging (Production-safe)
const safeLog = IS_PRODUCTION ? () => {} : console.log;

// 🌍 Global State
let currentUser = null;
let currentProduct = null;
let logyMessages = [{sender:'ai', text:'مرحباً! أنا Logy AI 🤖 كيف يمكنني مساعدتك اليوم؟'}];
let unreadNotifications = 0;

// 🎯 Pi Network SDK
let Pi = null;
let piSDKInitialized = false;

// ============================================
// 🚀 INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    safeLog('🚀 Forsale AI Frontend Initializing...');
    
    initializeLoginButtons();
    initializeChat();
    checkStoredUser();
    setupPiSDK();
});

// ============================================
// 🔐 AUTHENTICATION FUNCTIONS
// ============================================

function initializeLoginButtons() {
    // Demo Login Button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', demoLogin);
    }
    
    // Pi Network Login Button
    const piLoginBtn = document.getElementById('pi-login-btn');
    if (piLoginBtn) {
        piLoginBtn.addEventListener('click', piNetworkLogin);
    }
}

function demoLogin() {
    safeLog('🔐 Demo login initiated');
    
    const email = document.getElementById('login-email')?.value || 'demo@forsale-ai.com';
    
    showLoading('جاري تسجيل الدخول...');
    
    setTimeout(() => {
        currentUser = {
            id: Date.now().toString(),
            email: email,
            username: 'مستخدم تجريبي',
            isPiUser: false,
            balance: 1000
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        safeLog('✅ Demo user logged in:', currentUser);
        
        hideLoading();
        showApp();
    }, 800);
}

function piNetworkLogin() {
    if (!piSDKInitialized || !Pi) {
        alert('⚠️ Pi Network SDK غير مهيئ. استخدم الدخول التجريبي أو تأكد من استخدام Pi Browser.');
        return;
    }
    
    Pi.authenticate(['username', 'payments'], onPiAuthSuccess)
      .then(authResult => {
          safeLog('🔐 Pi Network auth result:', authResult);
      })
      .catch(error => {
          safeLog('❌ Pi Network auth error:', error);
          alert('فشل المصادقة عبر Pi Network. استخدم الدخول التجريبي.');
      });
}

function onPiAuthSuccess(authResult) {
    safeLog('✅ Pi Network authentication successful:', authResult);
    
    showLoading('جاري تحميل بيانات Pi...');
    
    currentUser = {
        id: authResult.user.uid,
        email: authResult.user.email || `${authResult.user.username}@pi`,
        username: authResult.user.username,
        isPiUser: true,
        piAccessToken: authResult.accessToken,
        balance: 5000
    };
    
    localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
    localStorage.setItem('pi_auth_data', JSON.stringify(authResult));
    
    setTimeout(() => {
        hideLoading();
        showApp();
        showNotification('✅ تم تسجيل الدخول بنجاح عبر Pi Network!');
    }, 1000);
}

function checkStoredUser() {
    try {
        const stored = localStorage.getItem('forsale_current_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user && user.id) {
                currentUser = user;
                safeLog('✅ Found stored user:', user);
                showApp();
            }
        }
    } catch (error) {
        safeLog('❌ Error parsing stored user:', error);
        localStorage.removeItem('forsale_current_user');
    }
}

// ============================================
// 📱 APP NAVIGATION
// ============================================

function showApp() {
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer && appContainer) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        initializeApp();
        safeLog('✅ App interface shown');
    }
}

function initializeApp() {
    renderCategories();
    renderProducts();
    updateNotificationDot();
    safeLog('✅ App initialized');
}

// ============================================
// 🛍️ PRODUCTS FUNCTIONS
// ============================================

const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro - 256GB',
        price: 105,
        category: 'electronics',
        description: 'آيفون 15 برو، حالة ممتازة، 256GB، مضمون من Apple، مع علبة وشاحن أصلي.',
        image: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        aiScore: 9.2,
        marketPrice: 110,
        specs: {
            'النوع': 'هاتف ذكي',
            'الماركة': 'Apple',
            'التخزين': '256GB',
            'الحالة': 'ممتازة'
        }
    },
    {
        id: 'p2',
        name: 'MacBook Pro M3 - 16GB',
        price: 155,
        category: 'electronics',
        description: 'لابتوب MacBook Pro 2024 بشاشة 14 بوصة، معالج M3، 16GB RAM، 512GB SSD.',
        image: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook+Pro',
        aiScore: 8.8,
        marketPrice: 160,
        specs: {
            'النوع': 'لابتوب',
            'الماركة': 'Apple',
            'المعالج': 'M3',
            'الذاكرة': '16GB'
        }
    },
    {
        id: 'p3',
        name: 'ساعة Apple Watch Series 9',
        price: 85,
        category: 'electronics',
        description: 'ساعة Apple Watch Series 9، GPS + Cellular، حالة جديدة، ضمان سنتين.',
        image: 'https://placehold.co/600x400/2ECC71/0a1128?text=Apple+Watch',
        aiScore: 9.5,
        marketPrice: 90,
        specs: {
            'النوع': 'ساعة ذكية',
            'الماركة': 'Apple',
            'الموديل': 'Series 9',
            'الشبكة': 'GPS + Cellular'
        }
    }
];

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = PRODUCTS.map(product => `
        <div class="product-card glass-panel" onclick="openProductDetail('${product.id}')">
            <div class="p-img-box">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="ai-tag">
                    <i class="fa-solid fa-brain"></i> ${product.aiScore}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${product.name}</div>
                <div class="p-price">${product.price} Pi</div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('level1-scroll');
    if (!container) return;
    
    container.innerHTML = `
        <div class="cat-item active" onclick="filterCategory('all')">
            <i class="fa-solid fa-layer-group"></i> الكل
        </div>
        <div class="cat-item" onclick="filterCategory('electronics')">
            <i class="fa-solid fa-laptop-code"></i> إلكترونيات
        </div>
        <div class="cat-item" onclick="filterCategory('real-estate')">
            <i class="fa-solid fa-building"></i> عقارات
        </div>
        <div class="cat-item" onclick="filterCategory('fashion')">
            <i class="fa-solid fa-tshirt"></i> أزياء
        </div>
    `;
}

function filterCategory(category) {
    safeLog(`Filtering by category: ${category}`);
    showNotification(`تصفية حسب: ${category}`);
}

// ============================================
// 📦 PRODUCT DETAIL FUNCTIONS
// ============================================

function openProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    
    // Update modal content
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price} Pi`;
    document.getElementById('detail-img').src = product.image;
    document.getElementById('detail-img').alt = product.name;
    document.getElementById('detail-desc').textContent = product.description;
    document.getElementById('ai-score').textContent = product.aiScore;
    document.getElementById('ai-market-price').textContent = `${product.marketPrice} Pi`;
    document.getElementById('shipping-eta').textContent = '3-5 أيام عمل';
    
    // Show modal
    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    safeLog(`📦 Product detail opened: ${product.name}`);
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
    safeLog('📦 Product detail closed');
}

function showDetailTab(tabName, element) {
    // Hide all tab contents
    document.querySelectorAll('.detail-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.detail-tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab and mark as active
    document.getElementById(`detail-${tabName}`).style.display = 'block';
    element.classList.add('active');
}

// ============================================
// 💰 PAYMENT FUNCTIONS (Pi Network Testnet)
// ============================================

function initiatePurchase() {
    if (!currentUser) {
        alert('⚠️ يجب تسجيل الدخول أولاً');
        return;
    }
    
    if (!currentProduct) {
        alert('⚠️ لا يوجد منتج محدد');
        return;
    }
    
    if (currentUser.isPiUser) {
        // Pi Network payment
        startPiPayment();
    } else {
        // Demo payment
        processDemoPayment();
    }
}

function startPiPayment() {
    if (!piSDKInitialized || !Pi) {
        alert('❌ Pi Network SDK غير متاح. تأكد من استخدام Pi Browser.');
        return;
    }
    
    // Show payment modal
    document.getElementById('payment-title').textContent = `دفع ${currentProduct.price} Pi`;
    document.getElementById('payment-details').innerHTML = `
        <p>المنتج: <strong>${currentProduct.name}</strong></p>
        <p>السعر: <strong style="color:var(--primary);">${currentProduct.price} Pi</strong></p>
        <p>الشبكة: <span style="color:var(--accent);">Testnet (تجريبي)</span></p>
    `;
    
    document.getElementById('product-detail-modal').style.display = 'none';
    document.getElementById('pi-payment-modal').style.display = 'block';
}

function processPiPayment() {
    showLoading('جاري معالجة الدفع عبر Pi Network...');
    
    const paymentData = {
        amount: currentProduct.price,
        memo: `شراء ${currentProduct.name}`,
        metadata: {
            productId: currentProduct.id,
            productName: currentProduct.name,
            buyerId: currentUser.id
        }
    };
    
    // Create Pi payment
    Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId) => {
            safeLog('✅ Pi payment ready for approval:', paymentId);
            approvePiPayment(paymentId);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            safeLog('✅ Pi payment ready for completion:', paymentId, txid);
            completePiPayment(paymentId, txid);
        },
        onCancel: (paymentId) => {
            safeLog('❌ Pi payment cancelled:', paymentId);
            hideLoading();
            showNotification('❌ تم إلغاء الدفع');
        },
        onError: (error, payment) => {
            safeLog('❌ Pi payment error:', error);
            hideLoading();
            alert('حدث خطأ في عملية الدفع: ' + error.message);
        }
    });
}

function approvePiPayment(paymentId) {
    // Simulate backend approval (in production, call your backend)
    setTimeout(() => {
        Pi.approvePayment(paymentId);
        safeLog(`✅ Pi payment ${paymentId} approved`);
    }, 1500);
}

function completePiPayment(paymentId, txid) {
    // Simulate backend completion (in production, call your backend)
    setTimeout(() => {
        Pi.completePayment(paymentId, txid);
        hideLoading();
        
        // Show success
        document.getElementById('pi-payment-modal').style.display = 'none';
        showNotification(`✅ تمت عملية الدفع بنجاح! رقم المعاملة: ${txid.substring(0, 12)}...`);
        
        // Create order
        createOrder(paymentId, txid);
        
        safeLog(`✅ Pi payment completed: ${paymentId}, TXID: ${txid}`);
    }, 2000);
}

function processDemoPayment() {
    showLoading('جاري معالجة الدفع التجريبي...');
    
    setTimeout(() => {
        hideLoading();
        
        // Demo order creation
        const orderId = `DEMO_${Date.now()}`;
        createOrder(orderId, `demo_tx_${Date.now()}`);
        
        showNotification(`✅ تمت عملية الدفع التجريبي بنجاح! رقم الطلب: ${orderId}`);
        closeProductDetailModal();
        
        safeLog(`✅ Demo payment completed for order: ${orderId}`);
    }, 1500);
}

function createOrder(paymentId, txid) {
    const order = {
        id: `ORDER_${Date.now()}`,
        productId: currentProduct.id,
        productName: currentProduct.name,
        price: currentProduct.price,
        paymentId: paymentId,
        transactionId: txid,
        status: 'processing',
        createdAt: new Date().toISOString(),
        shipping: {
            carrier: 'Logy AI Express',
            estimatedDays: '3-5',
            trackingId: `TRACK_${Date.now()}`
        }
    };
    
    // Save order
    let orders = JSON.parse(localStorage.getItem('forsale_orders') || '[]');
    orders.push(order);
    localStorage.setItem('forsale_orders', JSON.stringify(orders));
    
    safeLog(`📦 Order created:`, order);
}

function closePaymentModal() {
    document.getElementById('pi-payment-modal').style.display = 'none';
    document.getElementById('product-detail-modal').style.display = 'block';
}

// ============================================
// 🤖 LOGY AI CHAT FUNCTIONS
// ============================================

function openLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'flex';
    renderChat();
}

function closeLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'none';
}

function initializeChat() {
    const input = document.getElementById('logy-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function renderChat() {
    const area = document.getElementById('logy-chat-area');
    if (!area) return;
    
    area.innerHTML = logyMessages.map(msg => `
        <div class="message-bubble msg-${msg.sender}">
            ${msg.text}
        </div>
    `).join('');
    
    area.scrollTop = area.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    logyMessages.push({
        sender: 'user',
        text: message
    });
    
    input.value = '';
    renderChat();
    
    // AI response (simulated)
    setTimeout(() => {
        const responses = [
            'أنا Logy AI! 🤖 يمكنني مساعدتك في البحث عن المنتجات، تحليل الأسعار، ومتابعة الشحنات.',
            'لشراء منتج، اضغط على الزر "شراء" وسأدير عملية الدفع والضمان تلقائياً.',
            'أنت تستخدم حالياً شبكة Pi Testnet. المعاملات هنا تجريبية ولأغراض الاختبار فقط.',
            'هل لديك أي استفسار عن منتج معين؟ يمكنني تحليل السعر والجودة لك.',
            'نظام الضمان (Escrow) لدينا يحفظ أموالك حتى تستلم المنتج ويوافق البائع على الإفراج.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        logyMessages.push({
            sender: 'ai',
            text: randomResponse
        });
        
        renderChat();
    }, 1000);
}

// ============================================
// 📱 UI HELPER FUNCTIONS
// ============================================

function showLoading(message = 'جاري التحميل...') {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    
    if (overlay && text) {
        text.textContent = message;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showNotification(message) {
    safeLog('📢 Notification:', message);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary);
        color: black;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <i class="fa-solid fa-bell"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) {
        dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function showView(viewName) {
    safeLog(`Switching to view: ${viewName}`);
    showNotification(`تم التبديل إلى: ${viewName}`);
}

function showOrders() {
    const orders = JSON.parse(localStorage.getItem('forsale_orders') || '[]');
    
    if (orders.length === 0) {
        alert('📦 لا توجد طلبات حالياً.');
    } else {
        const ordersList = orders.map(order => 
            `رقم الطلب: ${order.id}\nالمنتج: ${order.productName}\nالحالة: ${order.status}`
        ).join('\n\n');
        
        alert(`📦 طلباتك:\n\n${ordersList}`);
    }
}

function showWallet() {
    const balance = currentUser ? currentUser.balance : 0;
    alert(`💰 رصيدك: ${balance} Pi\n\nالمعاملات:\n${currentUser.isPiUser ? '✅ حساب Pi Network نشط' : '👤 حساب تجريبي'}`);
}

function openAiUploadModal() {
    alert('📤 ميزة إضافة المنتج بواسطة AI قريباً!');
}

function openNotificationsModal() {
    showNotification('🔔 لا توجد إشعارات جديدة');
}

function openSettingsModal() {
    alert('⚙️ صفحة الإعدادات قيد التطوير');
}

// ============================================
// 🌐 PI NETWORK SDK SETUP
// ============================================

function setupPiSDK() {
    // Wait for Pi SDK to load
    if (typeof window.Pi === 'undefined') {
        setTimeout(setupPiSDK, 500);
        return;
    }
    
    Pi = window.Pi;
    
    // Initialize Pi SDK
    Pi.init({
        version: "2.0",
        sandbox: !IS_PRODUCTION  // Use sandbox in development
    }).then(() => {
        piSDKInitialized = true;
        safeLog('✅ Pi Network SDK initialized successfully');
        
        // Check for incomplete payments
        const authData = localStorage.getItem('pi_auth_data');
        if (authData) {
            try {
                Pi.authenticate(['username', 'payments'], onPiAuthSuccess);
            } catch (error) {
                safeLog('⚠️ Auto-authentication failed:', error);
            }
        }
    }).catch(error => {
        safeLog('❌ Pi Network SDK initialization failed:', error);
        piSDKInitialized = false;
    });
}

// ============================================
// 🎨 ANIMATION STYLES
// ============================================

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

safeLog('🎉 Forsale AI Frontend loaded successfully!');
