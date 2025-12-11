<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Forsale AI - سوق المستقبل</title>
    
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- Authentication Container -->
<div id="auth-container">
    <div class="auth-logo">
        <span style="background:var(--accent);color:black;font-size:14px;padding:2px 8px;border-radius:6px">AI</span> 
        Forsale
    </div>
    <p style="color:var(--text-muted);margin-bottom:30px;text-align:center">
        السوق العالمي الذكي - مدعوم بـ Pi Network<br>
        <small style="font-size:12px;opacity:0.7">Automated by AI - No Human Intervention 100%</small>
    </p>

    <div class="auth-card">
        <h2 style="margin-bottom:20px">تسجيل الدخول الآمن</h2>
        
        <button class="main-btn pi-btn" id="pi-login-btn" type="button">
            <i class="fa-solid fa-network-wired"></i> تسجيل الدخول عبر Pi Network
        </button>

        <div style="margin:20px 0;text-align:center;color:var(--text-muted);font-size:12px;">
            أو استخدم الدخول التجريبي
        </div>
        
        <div class="input-group">
            <i class="fa-solid fa-envelope"></i>
            <input type="email" placeholder="البريد الإلكتروني" id="login-email" value="demo@forsale-ai.com">
        </div>
        
        <div class="input-group">
            <i class="fa-solid fa-lock"></i>
            <input type="password" placeholder="كلمة المرور" id="login-password" value="demo123">
        </div>

        <button class="main-btn" id="login-btn" type="button">
            دخول تجريبي <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="auth-footer">
            <p style="font-size:11px;line-height:1.6;color:var(--text-muted);margin-top:15px;">
                🤖 <strong>Logy AI</strong> يدير كل شيء تلقائياً
            </p>
        </div>
    </div>
</div>

<!-- Main Application Container -->
<div id="app-container" style="display:none;">
    <div class="fixed-header-wrapper">
        <div class="header">
            <div class="content-wrapper">
                <div class="logo">
                    <span class="ai-badge">AI</span>
                    <i class="fa-solid fa-store"></i> Forsale
                </div>
                <div style="display:flex; gap:10px;">
                    <div class="icon-btn primary" onclick="alert('قريباً!')">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                    <div class="notification-icon-container">
                        <div class="notification-dot" id="notification-dot"></div>
                        <div class="icon-btn" onclick="openNotificationsModal()">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                    </div>
                    <div class="icon-btn" onclick="openSettingsModal()">
                        <i class="fa-solid fa-gear"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="content-wrapper">
            <div class="search-box">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" placeholder="ابحث بذكاء اصطناعي...">
            </div>
            
            <div class="cats-scroll" id="level1-scroll"></div>

            <h2 style="font-size:20px;color:var(--text-main);margin:20px 0 15px;">
                <i class="fa-solid fa-robot" style="color:var(--accent);"></i> اقتراحات Logy AI
            </h2>
            
            <div class="products-grid" id="products-grid"></div>
        </div>
    </div>

    <!-- Product Detail Modal -->
    <div id="product-detail-modal" style="display:none;">
        <div class="detail-header">
            <div class="logo">
                <span class="ai-badge">AI</span>
                <i class="fa-solid fa-eye"></i> تفاصيل المنتج
            </div>
            <div class="icon-btn" onclick="closeProductDetailModal()">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
        <div class="content-wrapper">
            <img id="detail-img" class="detail-img" src="" alt="صورة المنتج">
            <div class="detail-title" id="detail-title"></div>
            <div class="detail-price" id="detail-price"></div>

            <h3 class="ai-section-title">
                <i class="fa-solid fa-microchip"></i> تحليل Logy AI
            </h3>
            <div class="glass-panel ai-price-card">
                <div class="stat-box" id="ai-score-box">
                    <div class="value" id="ai-score">0.0</div>
                    <div class="label">نقطة قوة العرض</div>
                </div>
                <div class="stat-box">
                    <div class="value" id="ai-market-price">0 Pi</div>
                    <div class="label">متوسط السوق</div>
                </div>
            </div>
            <p id="ai-summary" style="font-size:13px;color:var(--text-muted);margin-top:10px;"></p>

            <h3 class="ai-section-title">
                <i class="fa-solid fa-truck-fast"></i> الشحن
            </h3>
            <div class="glass-panel" style="padding:15px;">
                <p>⏱️ التوصيل: <span id="shipping-eta" style="font-weight:bold;color:var(--accent);">3-5 أيام</span></p>
                <p>🚚 الناقل: <span id="shipping-carrier" style="font-weight:bold;">Logy AI Express</span></p>
            </div>
            
            <div class="detail-tabs-container glass-panel">
                <div class="detail-tabs-scroll">
                    <div class="detail-tab-item active" onclick="showDetailTab('description', this)">
                        <i class="fa-solid fa-file-alt"></i> الوصف
                    </div>
                    <div class="detail-tab-item" onclick="showDetailTab('specs', this)">
                        <i class="fa-solid fa-cogs"></i> المواصفات
                    </div>
                </div>
                <div class="detail-tab-content" id="detail-description">
                    <p id="detail-desc"></p>
                </div>
                <div class="detail-tab-content" id="detail-specs" style="display:none;">
                    <ul id="specs-list"></ul>
                </div>
            </div>
        </div>
        <div class="buy-fixed-bar">
            <div class="content-wrapper">
                <button class="buy-btn" onclick="initiatePurchase()">
                    <i class="fa-solid fa-shopping-cart"></i> شراء الآن
                </button>
            </div>
        </div>
    </div>

    <!-- Logy AI Chat Modal -->
    <div id="logyAiModal" style="display:none;">
        <div class="logy-chat-header">
            <div class="logo">
                <span class="ai-badge">AI</span>
                <i class="fa-solid fa-robot"></i> Logy AI
            </div>
            <div class="icon-btn" onclick="closeLogyAiModal()">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
        <div class="logy-chat-area" id="logy-chat-area"></div>
        <div class="logy-input-bar">
            <input type="text" id="logy-input" placeholder="اسأل Logy AI...">
            <div class="logy-send-btn" onclick="sendMessage()">
                <i class="fa-solid fa-paper-plane"></i>
            </div>
        </div>
    </div>

    <!-- Footer Navigation -->
    <div class="footer-nav">
        <div class="nav-item active" onclick="showView('home')">
            <i class="fa-solid fa-house"></i>
            <span>الرئيسية</span>
        </div>
        <div class="nav-item" onclick="openLogyAiModal()">
            <i class="fa-solid fa-robot"></i>
            <span>Logy AI</span>
        </div>
        <div class="nav-item" onclick="openOrdersModal()">
            <i class="fa-solid fa-box"></i>
            <span>الطلبات</span>
        </div>
        <div class="nav-item" onclick="openWalletModal()">
            <i class="fa-solid fa-wallet"></i>
            <span>المحفظة</span>
        </div>
    </div>
</div>

<!-- Inline Script للتأكد من العمل -->
<script>
// Global State
let currentUser = null;
let currentProduct = null;
let logyMsgs = [{s:'ai', t:'مرحباً! أنا Logy AI 🤖'}];

// Demo Login
function demoLogin() {
    const btn = document.getElementById('login-btn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الدخول...';
    btn.disabled = true;
    
    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            email: 'demo@forsale-ai.com',
            username: 'Demo User'
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        initializeApp();
        
        setTimeout(() => {
            logyMsgs.push({s:'ai', t:'مرحباً في الوضع التجريبي! 🎮'});
        }, 500);
    }, 800);
}

// Products Data
const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro',
        price: 105000,
        cat: 'tech',
        details: 'آيفون 15 برو مستعمل، حالة ممتازة، 256GB.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {score:9.2, market_price:110000, summary:'عرض ممتاز!', price_state_color:'#00f2ff'},
        shipping_ai: {eta:'3-5 أيام', carrier:'Logy AI Express'},
        specs: {'الماركة':'أبل','التخزين':'256GB'}
    },
    {
        id: 'p2',
        name: 'MacBook Pro 2024',
        price: 155000,
        cat: 'tech',
        details: 'لابتوب احترافي، M3 Max.',
        img: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook',
        ai_analysis: {score:8.8, market_price:155000, summary:'سعر مناسب', price_state_color:'#FFD700'},
        shipping_ai: {eta:'5-7 أيام', carrier:'Logy AI Express'},
        specs: {'الماركة':'أبل','المعالج':'M3 Max'}
    }
];

// Render Functions
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = PRODUCTS.map(p => `
        <div class="product-card glass-panel" onclick="openProductDetail('${p.id}')">
            <div class="p-img-box">
                <img src="${p.img}" alt="${p.name}">
                <div class="ai-tag" style="border-color:${p.ai_analysis.price_state_color};color:${p.ai_analysis.price_state_color};">
                    <i class="fa-solid fa-brain"></i> ${p.ai_analysis.score}
                </div>
            </div>
            <div class="p-details">
                <div class="p-name">${p.name}</div>
                <div class="p-price">${p.price.toLocaleString()} Pi</div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('level1-scroll');
    container.innerHTML = `
        <div class="cat-item active"><i class="fa-solid fa-layer-group"></i> الكل</div>
        <div class="cat-item"><i class="fa-solid fa-laptop-code"></i> إلكترونيات</div>
        <div class="cat-item"><i class="fa-solid fa-building"></i> عقارات</div>
    `;
}

function openProductDetail(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    
    currentProduct = p;
    
    document.getElementById('detail-title').textContent = p.name;
    document.getElementById('detail-price').textContent = `${p.price.toLocaleString()} Pi`;
    document.getElementById('detail-img').src = p.img;
    document.getElementById('detail-desc').textContent = p.details;
    document.getElementById('ai-score').textContent = p.ai_analysis.score;
    document.getElementById('ai-market-price').textContent = `${p.ai_analysis.market_price.toLocaleString()} Pi`;
    document.getElementById('ai-summary').textContent = p.ai_analysis.summary;
    document.getElementById('shipping-eta').textContent = p.shipping_ai.eta;
    document.getElementById('shipping-carrier').textContent = p.shipping_ai.carrier;
    
    const specs = document.getElementById('specs-list');
    specs.innerHTML = Object.entries(p.specs).map(([k,v]) => 
        `<li style="display:flex;justify-content:space-between;padding:5px 0;">
            <span>${k}</span><span style="font-weight:bold;">${v}</span>
        </li>`
    ).join('');
    
    document.getElementById('product-detail-modal').style.display = 'block';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
}

function showDetailTab(tab, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`detail-${tab}`).style.display = 'block';
    el.classList.add('active');
}

function initiatePurchase() {
    alert(`🎉 محاكاة شراء!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi`);
    closeProductDetailModal();
}

// Chat Functions
function openLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'flex';
    renderChat();
}

function closeLogyAiModal() {
    document.getElementById('logyAiModal').style.display = 'none';
}

function renderChat() {
    const area = document.getElementById('logy-chat-area');
    area.innerHTML = logyMsgs.map(m => 
        `<div class="message-bubble msg-${m.s}">${m.t}</div>`
    ).join('');
    area.scrollTop = area.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('logy-input');
    const text = input.value.trim();
    if (!text) return;
    
    logyMsgs.push({s:'user', t:text});
    input.value = '';
    renderChat();
    
    setTimeout(() => {
        logyMsgs.push({s:'ai', t:'شكراً! 🤖 يمكنني مساعدتك.'});
        renderChat();
    }, 1000);
}

// Other Modals
function openNotificationsModal() {
    alert('🔔 لا توجد إشعارات');
}

function openSettingsModal() {
    alert('⚙️ الإعدادات قريباً');
}

function openOrdersModal() {
    alert('📦 لا توجد طلبات');
}

function openWalletModal() {
    alert('💰 المحفظة قريباً');
}

function showView(v) {
    document.querySelectorAll('.footer-nav .nav-item').forEach(i => i.classList.remove('active'));
    event?.currentTarget?.classList.add('active');
}

// Initialize
function initializeApp() {
    renderCategories();
    renderProducts();
}

// Setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Forsale AI Loading...');
    
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');
    
    if (loginBtn) {
        loginBtn.onclick = function(e) {
            e.preventDefault();
            console.log('✅ Login clicked');
            demoLogin();
        };
    }
    
    if (piLoginBtn) {
        piLoginBtn.onclick = function(e) {
            e.preventDefault();
            alert('⚠️ Pi Network login يحتاج Pi Browser\n\nاستخدم الدخول التجريبي للاختبار.');
        };
    }
    
    // Check stored user
    const stored = localStorage.getItem('forsale_current_user');
    if (stored) {
        currentUser = JSON.parse(stored);
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        initializeApp();
    }
    
    console.log('✅ Ready!');
});
</script>

</body>
</html>
