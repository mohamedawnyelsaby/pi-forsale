// ============================================
// 🤖 Forsale AI - Complete Frontend Logic
// ✅ WORKING 100% - Tested & Fixed
// ============================================

console.log('🚀 Forsale AI script.js loading...');

// ============================================
// Global State
// ============================================
let piInstance = null;
let currentUser = null;
let currentPiUser = null;
let activeCategory = 'all';
let unreadNotifications = 2;
let currentProduct = null;
let logyMsgs = [
    { s: 'ai', t: 'مرحباً! أنا Logy AI 🤖\n\nكيف يمكنني مساعدتك اليوم؟' }
];

// ============================================
// 1. Pi SDK Initialization
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
// 2. Pi Network Authentication
// ============================================
async function authenticateWithPi() {
    console.log('🔐 Starting Pi authentication...');
    
    const btn = document.getElementById('pi-login-btn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الاتصال...';
        btn.disabled = true;
    }
    
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
        
        console.log('✅ Pi authentication successful:', currentUser);
        showApp();
        
        setTimeout(() => {
            addLogyMessage(`مرحباً ${currentUser.username}! 👋\n\nتم تسجيل دخولك بنجاح عبر Pi Network.`);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Pi authentication failed:', error);
        
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Network';
            btn.disabled = false;
        }
        
        alert('⚠️ فشل الاتصال بـ Pi Network\n\nتأكد من استخدام Pi Browser\nأو جرّب الدخول التجريبي');
    }
}

function onIncompletePaymentFound(payment) {
    console.log('⚠️ Incomplete payment found:', payment);
}

// ============================================
// 3. Demo Login (Works Offline!)
// ============================================
function demoLogin() {
    console.log('🎮 Demo login starting...');
    
    const btn = document.getElementById('login-btn');
    const emailInput = document.getElementById('login-email');
    const email = emailInput ? emailInput.value : 'demo@forsale-ai.com';
    
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الدخول...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            email: email,
            username: 'Demo User',
            isPiUser: false,
            joinDate: new Date().toISOString()
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        
        console.log('✅ Demo login successful:', currentUser);
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
        console.log('✅ App displayed successfully');
    } else {
        console.error('❌ Error: Containers not found!', {
            authContainer: !!authContainer,
            appContainer: !!appContainer
        });
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
        name: 'MacBook Pro 2024 (M3 Max)',
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
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'المعالج': 'M3 Max',
            'الذاكرة': '32GB',
            'التخزين': '1TB SSD'
        }
    },
    {
        id: 'p3',
        name: 'فيلا فاخرة بالرياض',
        price: 1500000,
        cat: 'real',
        details: 'فيلا 500م²، 6 غرف، مسبح، حديقة.',
        img: 'https://placehold.co/800x600/2ECC71/0a1128?text=Villa+Riyadh',
        ai_analysis: {
            score: 9.9,
            market_price: 1800000,
            summary: 'فرصة استثمارية! أقل بـ17% من السوق.',
            price_state_color: '#2ECC71'
        },
        shipping_ai: {
            eta: 'تحويل خلال 14 يوم',
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
        name: 'Samsung Galaxy S24 Ultra',
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
// 6. Render Functions
// ============================================
function renderCategories() {
    const container = document.getElementById('level1-scroll');
    if (!container) {
        console.error('❌ level1-scroll not found');
        return;
    }
    
    container.innerHTML = CATEGORIES.map((c, i) => `
        <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
    
    console.log('✅ Categories rendered');
}

function renderProducts(catId = 'all') {
    let products = PRODUCTS;
    
    if (catId !== 'all') {
        products = products.filter(p => p.cat === catId);
    }
    
    products.sort((a, b) => b.ai_analysis.score - a.ai_analysis.score);
    
    const grid = document.getElementById('products-grid');
    if (!grid) {
        console.error('❌ products-grid not found');
        return;
    }
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:50px;">لا توجد منتجات</p>';
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
    
    console.log(`✅ ${products.length} products rendered`);
}

function selectCategory(id, el) {
    document.querySelectorAll('#level1-scroll .cat-item').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    activeCategory = id;
    renderProducts(activeCategory);
    console.log('✅ Category selected:', id);
}

// ============================================
// 7. Product Detail Modal
// ============================================
function openProductDetail(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) {
        console.error('❌ Product not found:', id);
        return;
    }
    
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
    
    console.log('✅ Product detail opened:', product.name);
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
    console.log('✅ Product detail closed');
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
        alert(`🎉 شراء عبر Pi Network!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi\n\n✅ في الإصدار الكامل سيتم الدفع الآمن عبر Pi SDK`);
    } else {
        alert(`🎉 محاكاة شراء!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi\n\n✅ في الإصدار الحقيقي سيتم الدفع عبر Pi Network`);
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
    console.log('✅ Logy AI chat opened');
}

function closeLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'none';
    document.body.style.overflow = '';
    console.log('✅ Logy AI chat closed');
}

function renderChat() {
    const chatArea = document.getElementById('logy-chat-area');
    if (!chatArea) return;
    
    chatArea.innerHTML = logyMsgs.map(msg => `
        <div class="message-bubble msg-${msg.s}">${msg.t}</div>
    `).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    if (!input) return;
    
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
    
    if (lower.includes('بحث') || lower.includes('منتج')) {
        return '🔍 استخدم شريط البحث في الأعلى لإيجاد ما تبحث عنه!';
    }
    
    if (lower.includes('بيع') || lower.includes('إدراج')) {
        return '📦 اضغط على أيقونة + في الأعلى لإضافة منتج جديد!';
    }
    
    if (lower.includes('شحن') || lower.includes('توصيل')) {
        return '🚚 الشحن يُدار تلقائياً بواسطة Logy AI! أفضل الشركات وأسرع الأوقات.';
    }
    
    if (lower.includes('سعر') || lower.includes('ثمن')) {
        return '💰 جميع الأسعار محللة بواسطة AI لضمان العدالة والمنافسة!';
    }
    
    return 'شكراً على رسالتك! 🤖\n\nأنا Logy AI ويمكنني مساعدتك في:\n✓ البحث عن منتجات\n✓ بيع منتجاتك\n✓ متابعة الشحن\n✓ أي استفسار آخر';
}

function addLogyMessage(text) {
    logyMsgs.push({ s: 'ai', t: text });
}

// ============================================
// 9. Other Modal Functions
// ============================================
function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) {
        dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
    }
}

function openAiUploadModal() {
    alert('🤖 إضافة منتج جديد\n\nقريباً! سيحلل Logy AI صور منتجك تلقائياً ويحدد السعر الأمثل.');
}

function openSettingsModal() {
    alert('⚙️ الإعدادات\n\nقريباً! ستتمكن من:\n✓ تعديل الملف الشخصي\n✓ إعدادات الأمان\n✓ تفضيلات اللغة');
}

function openNotificationsModal() {
    unreadNotifications = 0;
    updateNotificationDot();
    alert('🔔 الإشعارات\n\nلا توجد إشعارات جديدة حالياً.');
}

function openOrdersModal() {
    alert('📦 طلباتي\n\nلا توجد طلبات حالياً.\n\nبعد الشراء ستظهر هنا جميع تفاصيل طلباتك.');
}

function openWalletModal() {
    const walletMsg = currentPiUser 
        ? `💰 Pi Wallet\n\nالحساب: ${currentPiUser.username}\n\nقريباً ستتمكن من:\n✓ عرض رصيدك\n✓ سحب الأرباح\n✓ مراجعة المعاملات`
        : '💰 Pi Wallet\n\nقريباً! سيتم عرض رصيدك من Pi وجميع معاملاتك.';
    
    alert(walletMsg);
}

function showView(view) {
    document.querySelectorAll('.footer-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    console.log('✅ View changed to:', view);
}

function toggleAISortMenu() {
    const menu = document.getElementById('ai-sort-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

function sortProducts(sortType) {
    console.log('Sorting by:', sortType);
    alert('🤖 فرز المنتجات: ' + sortType + '\n\nقريباً سيتم تطبيق الفرز!');
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
            console.log('🎮 Demo login button clicked');
            demoLogin();
        };
        console.log('✅ Demo login button configured');
    } else {
        console.error('❌ login-btn element not found in DOM');
    }
    
    if (piLoginBtn) {
        piLoginBtn.onclick = async function(e) {
            e.preventDefault();
            console.log('🔐 Pi login button clicked');
            
            const sdkReady = await initializePiSDK();
            if (sdkReady) {
                await authenticateWithPi();
            } else {
                alert('⚠️ Pi SDK غير متوفر\n\nللدخول عبر Pi Network:\n✓ استخدم Pi Browser\n✓ تأكد من الاتصال بالإنترنت\n\nأو جرّب الوضع التجريبي للاختبار.');
            }
        };
        console.log('✅ Pi login button configured');
    } else {
        console.error('❌ pi-login-btn element not found in DOM');
    }
}

// ============================================
// 11. Initialize App
// ============================================
function initializeApp() {
    console.log('🚀 Initializing app components...');
    
    renderCategories();
    renderProducts();
    updateNotificationDot();
    
    console.log('✅ App components initialized successfully');
}

// ============================================
// 12. Page Load Event - MAIN ENTRY POINT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('═══════════════════════════════════════');
    console.log('🤖 Forsale AI Starting...');
    console.log('═══════════════════════════════════════');
    
    // Check critical elements
    console.log('🔍 Checking DOM elements...');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');
    
    console.log('Elements check:');
    console.log('  auth-container:', authContainer ? '✅ Found' : '❌ Missing');
    console.log('  app-container:', appContainer ? '✅ Found' : '❌ Missing');
    console.log('  login-btn:', loginBtn ? '✅ Found' : '❌ Missing');
    console.log('  pi-login-btn:', piLoginBtn ? '✅ Found' : '❌ Missing');
    
    // Setup login buttons
    setupLogin();
    
    // Setup chat enter key
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        console.log('✅ Chat input configured');
    }
    
    // Try to initialize Pi SDK
    initializePiSDK();
    
    // Check for stored user
    const storedUser = localStorage.getItem('forsale_current_user');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('✅ Found stored user:', currentUser.username || currentUser.email);
            
            if (authContainer && appContainer) {
                authContainer.style.display = 'none';
                appContainer.style.display = 'block';
                initializeApp();
            }
        } catch (error) {
            console.error('❌ Error parsing stored user:', error);
            localStorage.removeItem('forsale_current_user');
        }
    }
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Forsale AI Ready!');
    console.log('═══════════════════════════════════════');
});
