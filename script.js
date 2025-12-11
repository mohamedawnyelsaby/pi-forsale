// ============================================
// 🤖 Forsale AI - Frontend Logic
// ✅ FIXED: Login now works 100%
// ============================================

// Global State
let piInstance = null;
let currentUser = null;
let currentPiUser = null;
let activeCategory = 'all';
let unreadNotifications = 2;
let currentProduct = null;
let logyMsgs = [
    { s: 'ai', t: 'مرحباً! أنا Logy AI 🤖\n\nكيف يمكنني مساعدتك؟' }
];

// ============================================
// 1. Initialize Pi SDK
// ============================================
async function initializePiSDK() {
    try {
        piInstance = window.Pi;
        if (!piInstance) {
            console.warn('⚠️ Pi SDK not available');
            return false;
        }
        console.log('✅ Pi SDK ready');
        return true;
    } catch (error) {
        console.error('❌ Pi SDK error:', error);
        return false;
    }
}

// ============================================
// 2. Pi Network Authentication
// ============================================
async function authenticateWithPi() {
    console.log('🔐 Authenticating with Pi...');
    
    const btn = document.getElementById('pi-login-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الاتصال...';
    btn.disabled = true;
    
    try {
        if (!piInstance) {
            throw new Error('Pi SDK not available');
        }
        
        const scopes = ['username', 'payments'];
        const authResult = await piInstance.authenticate(scopes, onIncompletePaymentFound);
        
        currentPiUser = authResult.user;
        currentUser = {
            id: currentPiUser.uid,
            username: currentPiUser.username,
            isPiUser: true,
            joinDate: new Date().toISOString()
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        
        console.log('✅ Pi login success:', currentUser);
        showApp();
        
        setTimeout(() => {
            addLogyMessage(`مرحباً ${currentUser.username}! 👋\n\nتم تسجيل دخولك بنجاح.`);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Pi auth failed:', error);
        btn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Network';
        btn.disabled = false;
        alert('فشل الاتصال بـ Pi Network. جرّب الوضع التجريبي.');
    }
}

function onIncompletePaymentFound(payment) {
    console.log('⚠️ Incomplete payment:', payment);
}

// ============================================
// 3. Demo Login (WORKS OFFLINE!)
// ============================================
function demoLogin() {
    console.log('🎮 Demo login starting...');
    
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('login-email').value || 'demo@forsale-ai.com';
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الدخول...';
    btn.disabled = true;
    
    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            email: email,
            username: 'Demo User',
            isPiUser: false,
            joinDate: new Date().toISOString()
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        
        console.log('✅ Demo login success:', currentUser);
        showApp();
        
        setTimeout(() => {
            addLogyMessage('مرحباً في الوضع التجريبي! 🎮\n\nيمكنك تصفح واختبار جميع الميزات.');
        }, 1000);
    }, 800);
}

// ============================================
// 4. Show App Function
// ============================================
function showApp() {
    console.log('📱 Showing app...');
    
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer && appContainer) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        initializeApp();
    } else {
        console.error('❌ Containers not found!');
    }
}

// ============================================
// 5. Products Data
// ============================================
const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group' },
    { id: 'tech', name: 'إلكترونيات', icon: 'fa-laptop-code' },
    { id: 'real', name: 'عقارات', icon: 'fa-building' },
    { id: 'fashion', name: 'أزياء', icon: 'fa-shirt' }
];

const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro (Titanium)',
        price: 105000,
        cat: 'tech',
        details: 'آيفون 15 برو مستعمل شهر واحد، حالة ممتازة (100%)، 256GB.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {
            score: 9.2,
            market_price: 110000,
            summary: 'عرض ممتاز! السعر أقل من السوق بـ5%.',
            price_state_color: '#00f2ff'
        },
        shipping_ai: {
            eta: '3-5 أيام',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
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
        details: 'لابتوب احترافي جديد، M3 Max، 32GB RAM.',
        img: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook+Pro',
        ai_analysis: {
            score: 8.8,
            market_price: 155000,
            summary: 'السعر مطابق للسوق.',
            price_state_color: '#FFD700'
        },
        shipping_ai: {
            eta: '5-7 أيام',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'المعالج': 'M3 Max',
            'الذاكرة': '32GB'
        }
    },
    {
        id: 'p3',
        name: 'فيلا فاخرة بالرياض',
        price: 1500000,
        cat: 'real',
        details: 'فيلا 500م²، 6 غرف، مسبح.',
        img: 'https://placehold.co/800x600/2ECC71/0a1128?text=Villa',
        ai_analysis: {
            score: 9.9,
            market_price: 1800000,
            summary: 'فرصة استثمارية! أقل بـ17%.',
            price_state_color: '#2ECC71'
        },
        shipping_ai: {
            eta: 'تحويل خلال 14 يوم',
            carrier: 'Logy AI Legal'
        },
        specs: {
            'الموقع': 'الرياض',
            'المساحة': '500م²',
            'الغرف': '6'
        }
    },
    {
        id: 'p4',
        name: 'Samsung Galaxy S24',
        price: 95000,
        cat: 'tech',
        details: 'جوال جديد، 512GB.',
        img: 'https://placehold.co/600x400/4A90E2/ffffff?text=Galaxy+S24',
        ai_analysis: {
            score: 8.5,
            market_price: 98000,
            summary: 'سعر جيد.',
            price_state_color: '#4A90E2'
        },
        shipping_ai: {
            eta: '2-4 أيام',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'سامسونج',
            'التخزين': '512GB'
        }
    }
];

// ============================================
// 6. Render Functions
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
    
    grid.innerHTML = products.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color};color:${p.ai_analysis.price_state_color};">
                    <i class="fa-solid fa-brain"></i> ${p.ai_analysis.score.toFixed(1)}
                </div>
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
// 7. Product Detail Modal
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
    
    if (currentPiUser) {
        alert(`🎉 شراء عبر Pi Network!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi\n\nللتفعيل الكامل، يحتاج backend.`);
    } else {
        alert(`🎉 محاكاة شراء!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi\n\nفي الإصدار الحقيقي سيتم الدفع عبر Pi Network.`);
    }
    
    closeProductDetailModal();
}

// ============================================
// 8. Logy AI Chat
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
    }, 1000);
}

function generateAIResponse(msg) {
    const lower = msg.toLowerCase();
    
    if (lower.includes('بحث')) return '🔍 استخدم شريط البحث في الأعلى!';
    if (lower.includes('بيع')) return '📦 اضغط + لإضافة منتج!';
    if (lower.includes('شحن')) return '🚚 الشحن تلقائي بالكامل!';
    
    return 'شكراً! 🤖 يمكنني مساعدتك في أي شيء.';
}

function addLogyMessage(text) {
    logyMsgs.push({ s: 'ai', t: text });
}

// ============================================
// 9. Other Functions
// ============================================
function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) {
        dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function openAiUploadModal() {
    alert('🤖 إضافة منتج قريباً!');
}

function openSettingsModal() {
    alert('⚙️ الإعدادات قريباً!');
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
    alert('💰 المحفظة قريباً!');
}

function showView(view) {
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    if (event?.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function toggleAISortMenu() {
    const menu = document.getElementById('ai-sort-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function sortProducts(sortType) {
    console.log('Sorting by:', sortType);
    alert('🤖 فرز المنتجات: ' + sortType);
}

// ============================================
// 10. Setup Login Buttons
// ============================================
function setupLogin() {
    console.log('🔧 Setting up login buttons...');
    
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');
    
    if (loginBtn) {
        loginBtn.onclick = function(e) {
            e.preventDefault();
            console.log('🎮 Demo login clicked');
            demoLogin();
        };
        console.log('✅ Demo login button ready');
    } else {
        console.error('❌ login-btn not found!');
    }
    
    if (piLoginBtn) {
        piLoginBtn.onclick = async function(e) {
            e.preventDefault();
            console.log('🔐 Pi login clicked');
            
            const sdkReady = await initializePiSDK();
            if (sdkReady) {
                await authenticateWithPi();
            } else {
                alert('⚠️ Pi SDK غير متوفر\n\nاستخدم Pi Browser للدخول عبر Pi Network.\n\nأو جرّب الوضع التجريبي.');
            }
        };
        console.log('✅ Pi login button ready');
    } else {
        console.error('❌ pi-login-btn not found!');
    }
}

// ============================================
// 11. Initialize App
// ============================================
function initializeApp() {
    console.log('🚀 Initializing app...');
    renderCategories();
    renderProducts();
    updateNotificationDot();
    console.log('✅ App initialized');
}

// ============================================
// 12. Page Load Event
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page loaded');
    console.log('🔍 Checking elements...');
    
    // Check if elements exist
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');
    
    console.log('auth-container:', authContainer ? '✅' : '❌');
    console.log('app-container:', appContainer ? '✅' : '❌');
    console.log('login-btn:', loginBtn ? '✅' : '❌');
    console.log('pi-login-btn:', piLoginBtn ? '✅' : '❌');
    
    // Setup login
    setupLogin();
    
    // Setup chat
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Try Pi SDK
    initializePiSDK();
    
    console.log('✅ Forsale AI Ready!');
});
