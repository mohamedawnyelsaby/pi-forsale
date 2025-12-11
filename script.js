// ============================================
// 🤖 Forsale AI - FIXED Frontend Logic
// ✅ Login now works WITHOUT backend!
// ============================================

// Configuration
const CONFIG = {
    API_URL: window.location.origin, // استخدام نفس الـ domain
    PI_NETWORK_MODE: 'sandbox',
    AI_ENABLED: true
};

// Global State
let piInstance = null;
let currentUser = null;
let currentPiUser = null;
let activeCategory = 'all';
let activeSub = null;
let unreadNotifications = 2;
let currentProduct = null;
let logyMsgs = [
    { 
        s: 'ai', 
        t: 'مرحباً! أنا Logy AI 🤖\n\nأنا مساعدك الشخصي الذكي. كيف يمكنني مساعدتك اليوم؟' 
    }
];

// ============================================
// 1. Pi Network SDK Initialization
// ============================================

async function initializePiSDK() {
    try {
        piInstance = window.Pi;
        
        if (!piInstance) {
            console.warn('⚠️ Pi SDK not available (not in Pi Browser)');
            return false;
        }
        
        console.log('✅ Pi SDK initialized');
        return true;
    } catch (error) {
        console.error('❌ Pi SDK error:', error);
        return false;
    }
}

// ============================================
// 2. Pi Network Authentication (FIXED!)
// ============================================

async function authenticateWithPi() {
    showLoading('جاري الاتصال بـ Pi Network...');
    
    try {
        if (!piInstance) {
            throw new Error('Pi SDK not available');
        }
        
        const scopes = ['username', 'payments'];
        const authResult = await piInstance.authenticate(scopes, onIncompletePaymentFound);
        
        currentPiUser = authResult.user;
        
        console.log('✅ Pi Authentication successful:', currentPiUser);
        
        currentUser = {
            id: currentPiUser.uid,
            username: currentPiUser.username,
            piId: currentPiUser.uid,
            joinDate: new Date().toISOString(),
            isPiUser: true
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        localStorage.setItem('forsale_pi_user', JSON.stringify(currentPiUser));
        
        hideLoading();
        showApp();
        
        setTimeout(() => {
            addLogyMessage(`مرحباً ${currentPiUser.username}! 👋\n\nتم تسجيل دخولك بنجاح. هل تريد مني أن أعرض لك أفضل العروض؟`);
        }, 2000);
        
        return authResult;
        
    } catch (error) {
        console.error('❌ Pi Authentication failed:', error);
        hideLoading();
        
        // Fallback to demo mode
        alert('⚠️ لا يمكن الاتصال بـ Pi Network\n\nسيتم استخدام الوضع التجريبي.\n\nللحصول على التجربة الكاملة، استخدم Pi Browser.');
        
        // Auto login with demo
        demoLogin();
        
        return null;
    }
}

// ============================================
// 3. Demo Login (FIXED - Works Offline!)
// ============================================

function demoLogin() {
    showLoading('جاري تسجيل الدخول...');
    
    setTimeout(() => {
        const email = document.getElementById('login-email')?.value || 'demo@forsale-ai.com';
        
        currentUser = { 
            id: Date.now(), 
            email: email,
            username: 'Demo User',
            joinDate: new Date().toISOString(),
            isPiUser: false
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        
        hideLoading();
        showApp();
        
        setTimeout(() => {
            addLogyMessage('مرحباً بك في الوضع التجريبي! 🎮\n\nيمكنك تصفح المنتجات واختبار جميع الميزات.');
        }, 1000);
    }, 1000);
}

// ============================================
// 4. Payment (FIXED - Works in Demo Mode!)
// ============================================

async function createPiPayment(product) {
    if (!piInstance) {
        // Demo mode payment
        showLoading('محاكاة عملية الدفع...');
        
        setTimeout(() => {
            hideLoading();
            alert(`🎉 محاكاة شراء ناجحة!\n\nالمنتج: ${product.name}\nالسعر: ${product.price.toLocaleString()} Pi\n\n✅ في الإصدار الحقيقي، سيتم الدفع عبر Pi Network`);
            
            closeProductDetailModal();
            
            addLogyMessage(`تم محاكاة شراء "${product.name}"!\n\nفي الإصدار الحقيقي:\n✓ دفع آمن عبر Pi\n✓ شحن تلقائي\n✓ تتبع لحظي`);
        }, 2000);
        
        return;
    }
    
    if (!currentPiUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    showLoading('جاري إنشاء طلب الدفع...');
    
    try {
        const paymentData = {
            amount: product.price,
            memo: `شراء: ${product.name}`,
            metadata: {
                productId: product.id,
                productName: product.name,
                buyerUid: currentPiUser.uid,
                timestamp: Date.now()
            }
        };
        
        const callbacks = {
            onReadyForServerApproval: function(paymentId) {
                console.log('📡 Payment approved:', paymentId);
                hideLoading();
                alert('✅ تمت الموافقة على الدفع!');
            },
            onReadyForServerCompletion: function(paymentId, txid) {
                console.log('📡 Payment completed:', paymentId, txid);
                hideLoading();
                alert('🎉 تم الدفع بنجاح!');
                closeProductDetailModal();
            },
            onCancel: function(paymentId) {
                console.log('⚠️ Payment cancelled:', paymentId);
                hideLoading();
                alert('تم إلغاء عملية الدفع');
            },
            onError: function(error, payment) {
                console.error('❌ Payment error:', error);
                hideLoading();
                alert(`خطأ في الدفع: ${error.message}`);
            }
        };
        
        await piInstance.createPayment(paymentData, callbacks);
        
    } catch (error) {
        console.error('❌ Payment failed:', error);
        hideLoading();
        alert('فشل إنشاء طلب الدفع');
    }
}

function onIncompletePaymentFound(payment) {
    console.log('⚠️ Incomplete payment found:', payment);
}

// ============================================
// 5. UI Functions
// ============================================

function showLoading(text = 'جاري التحميل...') {
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        // Create loading overlay if doesn't exist
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        `;
        overlay.innerHTML = `
            <i class="fa-solid fa-robot fa-3x" style="color: #00f2ff; animation: spin 2s linear infinite; margin-bottom: 20px;"></i>
            <p id="loading-text" style="color: white; font-size: 16px;">${text}</p>
        `;
        document.body.appendChild(overlay);
    } else {
        document.getElementById('loading-text').textContent = text;
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    initializeApp();
}

// ============================================
// 6. Products Data
// ============================================

const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group', subs: [] },
    { 
        id: 'tech', 
        name: 'إلكترونيات', 
        icon: 'fa-laptop-code', 
        subs: [
            { id: 'mobile', name: 'هواتف' },
            { id: 'laptops', name: 'حواسيب' },
            { id: 'accs', name: 'إكسسوارات' }
        ] 
    },
    { 
        id: 'real', 
        name: 'عقارات', 
        icon: 'fa-building', 
        subs: [
            { id: 'apartments', name: 'شقق' },
            { id: 'villas', name: 'فيلات' }
        ] 
    },
    { 
        id: 'fashion', 
        name: 'أزياء', 
        icon: 'fa-shirt', 
        subs: [
            { id: 'clothes', name: 'ملابس' },
            { id: 'shoes', name: 'أحذية' }
        ] 
    }
];

const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro (Titanium)',
        price: 105000,
        cat: 'tech',
        details: 'آيفون 15 برو مستعمل شهر واحد، حالة ممتازة (100%)، تيتانيوم، 256GB.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {
            score: 9.2,
            market_price: 110000,
            summary: 'عرض ممتاز! السعر أقل من السوق بـ5%. يوصي به Logy AI.',
            price_state_color: '#00f2ff'
        },
        shipping_ai: {
            eta: '3-5 أيام',
            problem_handling: 'مراقبة AI 24/7',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'الموديل': 'آيفون 15 برو',
            'التخزين': '256GB',
            'اللون': 'تيتانيوم',
            'البطارية': '98%'
        }
    },
    {
        id: 'p2',
        name: 'MacBook Pro 2024',
        price: 155000,
        cat: 'tech',
        details: 'لابتوب احترافي جديد، M3 Max، 32GB RAM، 1TB SSD.',
        img: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook+Pro',
        ai_analysis: {
            score: 8.8,
            market_price: 155000,
            summary: 'السعر مطابق للسوق. جودة ممتازة.',
            price_state_color: '#FFD700'
        },
        shipping_ai: {
            eta: '5-7 أيام',
            problem_handling: 'مراقبة AI 24/7',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'المعالج': 'M3 Max',
            'الذاكرة': '32GB',
            'التخزين': '1TB'
        }
    },
    {
        id: 'p3',
        name: 'فيلا فاخرة بالرياض',
        price: 1500000,
        cat: 'real',
        details: 'فيلا 500م²، 6 غرف، مسبح، حديقة.',
        img: 'https://placehold.co/800x600/2ECC71/0a1128?text=Villa',
        ai_analysis: {
            score: 9.9,
            market_price: 1800000,
            summary: 'فرصة استثمارية! أقل بـ17% من السوق.',
            price_state_color: '#2ECC71'
        },
        shipping_ai: {
            eta: 'تحويل خلال 14 يوم',
            problem_handling: 'مراجعة قانونية AI',
            carrier: 'Logy AI Legal'
        },
        specs: {
            'الموقع': 'الرياض',
            'المساحة': '500م²',
            'الغرف': '6',
            'الحالة': 'جديد'
        }
    },
    {
        id: 'p4',
        name: 'Samsung Galaxy S24',
        price: 95000,
        cat: 'tech',
        details: 'جوال جديد، 512GB، كاميرا 200MP.',
        img: 'https://placehold.co/600x400/4A90E2/ffffff?text=Galaxy+S24',
        ai_analysis: {
            score: 8.5,
            market_price: 98000,
            summary: 'سعر جيد، أقل بـ3% من السوق.',
            price_state_color: '#4A90E2'
        },
        shipping_ai: {
            eta: '2-4 أيام',
            problem_handling: 'مراقبة AI 24/7',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'سامسونج',
            'الموديل': 'S24 Ultra',
            'التخزين': '512GB',
            'الكاميرا': '200MP'
        }
    }
];

// ============================================
// 7. Rendering Functions
// ============================================

function renderCategories() {
    const container = document.getElementById('level1-scroll');
    if (!container) return;
    
    container.innerHTML = CATEGORIES.map((c, i) => `
        <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

function renderProducts(catId = 'all') {
    let products = PRODUCTS;
    
    if (catId !== 'all') {
        products = products.filter(p => p.cat === catId);
    }
    
    products.sort((a, b) => b.ai_analysis.score - a.ai_analysis.score);
    
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:50px;">لا توجد منتجات.</p>';
        return;
    }
    
    grid.innerHTML = products.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color};color:${p.ai_analysis.price_state_color};">
                    <i class="fa-solid fa-brain"></i> ${p.ai_analysis.score.toFixed(1)}
                </div>
                ${p.ai_analysis.score >= 9.0 ? '<div class="ai-pick-badge">AI Pick</div>' : ''}
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

function selectCategory(id, el) {
    document.querySelectorAll('#level1-scroll .cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    renderProducts(activeCategory);
}

// ============================================
// 8. Product Detail Modal
// ============================================

function openProductDetail(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    
    currentProduct = product;
    
    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-price').textContent = `${product.price.toLocaleString()} Pi`;
    document.getElementById('detail-img').src = product.img;
    document.getElementById('detail-desc').textContent = product.details;
    document.getElementById('ai-score').textContent = product.ai_analysis.score.toFixed(1);
    document.getElementById('ai-market-price').textContent = `${product.ai_analysis.market_price.toLocaleString()} Pi`;
    document.getElementById('ai-summary').textContent = product.ai_analysis.summary;
    
    document.getElementById('ai-score-box').style.borderColor = product.ai_analysis.price_state_color;
    document.getElementById('ai-score').style.color = product.ai_analysis.price_state_color;
    
    document.getElementById('shipping-eta').textContent = product.shipping_ai.eta;
    document.getElementById('shipping-carrier').textContent = product.shipping_ai.carrier;
    
    const specsList = document.getElementById('specs-list');
    specsList.innerHTML = Object.entries(product.specs).map(([key, value]) => `
        <li style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed rgba(255,255,255,0.05);">
            <span style="color:var(--text-muted);">${key}</span>
            <span style="font-weight:bold;">${value}</span>
        </li>
    `).join('');
    
    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function showDetailTab(tabId, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`detail-${tabId}`).style.display = 'block';
    el.classList.add('active');
}

function initiatePurchase() {
    if (!currentProduct) return;
    createPiPayment(currentProduct);
}

// ============================================
// 9. Logy AI Chat
// ============================================

function openLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderChat();
}

function closeLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'none';
    document.body.style.overflow = '';
}

function renderChat() {
    const chatArea = document.getElementById('logy-chat-area');
    chatArea.innerHTML = logyMsgs.map(msg => `
        <div class="message-bubble msg-${msg.s}">${msg.t}</div>
    `).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const text = input.value.trim();
    if (text === '') return;
    
    logyMsgs.push({ s: 'user', t: text });
    input.value = '';
    renderChat();
    
    setTimeout(() => {
        const response = generateAIResponse(text);
        logyMsgs.push({ s: 'ai', t: response });
        renderChat();
    }, 1500);
}

function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('بحث') || msg.includes('منتج')) {
        return '🔍 استخدم شريط البحث في الأعلى وصف ما تبحث عنه!';
    }
    
    if (msg.includes('بيع') || msg.includes('إدراج')) {
        return '📦 اضغط على + في الأعلى لإضافة منتج جديد!';
    }
    
    if (msg.includes('شحن')) {
        return '🚚 أنا أدير الشحن تلقائياً باستخدام أفضل الشركات!';
    }
    
    return `شكراً! 🤖\n\nيمكنني مساعدتك في:\n✓ البحث\n✓ البيع\n✓ الشحن\n✓ أي استفسار`;
}

function addLogyMessage(text) {
    logyMsgs.push({ s: 'ai', t: text });
}

// ============================================
// 10. Other Modal Functions
// ============================================

function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) {
        dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function openAiUploadModal() {
    alert('🤖 إضافة منتج\n\nقريباً! سيحلل Logy AI صور منتجك ويحدد السعر تلقائياً.');
}

function openSettingsModal() {
    alert('⚙️ الإعدادات\n\nقريباً!');
}

function openNotificationsModal() {
    unreadNotifications = 0;
    updateNotificationDot();
    alert('🔔 لا توجد إشعارات جديدة');
}

function openOrdersModal() {
    alert('📦 لا توجد طلبات حالياً');
}

function openWalletModal() {
    alert('💰 المحفظة\n\nقريباً! ستعرض رصيدك من Pi.');
}

function showView(view) {
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event?.currentTarget?.classList.add('active');
}

// ============================================
// 11. Authentication Setup (FIXED!)
// ============================================

function setupLogin() {
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            demoLogin();
        });
    }

    if (piLoginBtn) {
        piLoginBtn.addEventListener('click', async () => {
            piLoginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الاتصال...';
            piLoginBtn.disabled = true;

            const success = await initializePiSDK();
            
            if (success) {
                await authenticateWithPi();
            } else {
                alert('⚠️ Pi SDK غير متوفر\n\nاستخدام Pi Browser مطلوب للدخول عبر Pi Network.\n\nسيتم استخدام الوضع التجريبي.');
                demoLogin();
            }
            
            piLoginBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Network';
            piLoginBtn.disabled = false;
        });
    }
}

function initializeApp() {
    renderCategories();
    renderProducts();
    updateNotificationDot();
}

// ============================================
// 12. Initialize on Page Load (FIXED!)
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Forsale AI Starting...');
    
    // Setup login buttons
    setupLogin();
    
    // Try to initialize Pi SDK
    await initializePiSDK();
    
    // Setup chat enter key
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    console.log('✅ Forsale AI Ready!');
});
