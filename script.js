// ============================================
// 🤖 Forsale AI - FIXED LOGIN
// ✅ Using addEventListener - WORKS 100%
// ============================================

console.log('🚀 Script loaded');

// Global State
let currentUser = null;
let currentProduct = null;
let logyMsgs = [{s:'ai', t:'مرحباً! أنا Logy AI 🤖'}];
let unreadNotifications = 2;

// ============================================
// LOGIN FUNCTIONS
// ============================================

function demoLogin() {
    console.log('✅ demoLogin called!');
    
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('login-email')?.value || 'demo@forsale-ai.com';
    
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            email: email,
            username: 'Demo User',
            isPiUser: false
        };
        
        localStorage.setItem('forsale_current_user', JSON.stringify(currentUser));
        console.log('✅ User saved:', currentUser);
        
        showApp();
    }, 500);
}

function showApp() {
    console.log('✅ showApp called!');
    
    const auth = document.getElementById('auth-container');
    const app = document.getElementById('app-container');
    
    if (auth && app) {
        auth.style.display = 'none';
        app.style.display = 'block';
        initializeApp();
        console.log('✅ App shown!');
    } else {
        console.error('❌ Containers not found!');
    }
}

// ============================================
// PRODUCTS DATA
// ============================================

const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro',
        price: 105000,
        cat: 'tech',
        details: 'آيفون 15 برو، حالة ممتازة، 256GB.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {
            score: 9.2,
            market_price: 110000,
            summary: 'عرض ممتاز!',
            price_state_color: '#00f2ff'
        },
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
        ai_analysis: {
            score: 8.8,
            market_price: 155000,
            summary: 'سعر مناسب',
            price_state_color: '#FFD700'
        },
        shipping_ai: {eta:'5-7 أيام', carrier:'Logy AI Express'},
        specs: {'الماركة':'أبل','المعالج':'M3 Max'}
    },
    {
        id: 'p3',
        name: 'فيلا بالرياض',
        price: 1500000,
        cat: 'real',
        details: 'فيلا 500م²، 6 غرف.',
        img: 'https://placehold.co/800x600/2ECC71/0a1128?text=Villa',
        ai_analysis: {
            score: 9.9,
            market_price: 1800000,
            summary: 'فرصة استثمارية!',
            price_state_color: '#2ECC71'
        },
        shipping_ai: {eta:'14 يوم', carrier:'Logy AI Legal'},
        specs: {'الموقع':'الرياض','المساحة':'500م²'}
    }
];

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
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
    if (!container) return;
    
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
            <span style="color:var(--text-muted);">${k}</span>
            <span style="font-weight:bold;">${v}</span>
        </li>`
    ).join('');
    
    document.getElementById('product-detail-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function showDetailTab(tab, el) {
    document.querySelectorAll('.detail-tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.detail-tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById(`detail-${tab}`).style.display = 'block';
    el.classList.add('active');
}

function initiatePurchase() {
    if (!currentProduct) return;
    alert(`🎉 محاكاة شراء!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi`);
    closeProductDetailModal();
}

// ============================================
// CHAT FUNCTIONS
// ============================================

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

// ============================================
// OTHER FUNCTIONS
// ============================================

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
    if (event?.currentTarget) event.currentTarget.classList.add('active');
}

function updateNotificationDot() {
    const dot = document.getElementById('notification-dot');
    if (dot) dot.style.display = unreadNotifications > 0 ? 'block' : 'none';
}

function initializeApp() {
    renderCategories();
    renderProducts();
    updateNotificationDot();
}

// ============================================
// MAIN - PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Forsale AI Loading...');
    console.log('═══════════════════════════════════════');
    
    // Get buttons
    const loginBtn = document.getElementById('login-btn');
    const piLoginBtn = document.getElementById('pi-login-btn');
    
    console.log('🔍 Buttons found:');
    console.log('  login-btn:', loginBtn ? '✅' : '❌');
    console.log('  pi-login-btn:', piLoginBtn ? '✅' : '❌');
    
    // Setup Demo Login Button
    if (loginBtn) {
        console.log('🔧 Setting up login-btn...');
        
        // Remove any existing listeners
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        
        // Add new listener
        newLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Login button CLICKED!');
            demoLogin();
        });
        
        console.log('✅ login-btn ready!');
    } else {
        console.error('❌ login-btn NOT FOUND!');
    }
    
    // Setup Pi Login Button
    if (piLoginBtn) {
        console.log('🔧 Setting up pi-login-btn...');
        
        const newPiBtn = piLoginBtn.cloneNode(true);
        piLoginBtn.parentNode.replaceChild(newPiBtn, piLoginBtn);
        
        newPiBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Pi button CLICKED!');
            alert('⚠️ Pi Network login\n\nيحتاج Pi Browser\n\nاستخدم الدخول التجريبي للاختبار.');
        });
        
        console.log('✅ pi-login-btn ready!');
    }
    
    // Setup chat
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    // Check stored user
    const stored = localStorage.getItem('forsale_current_user');
    if (stored) {
        try {
            currentUser = JSON.parse(stored);
            console.log('✅ Found stored user');
            showApp();
        } catch (e) {
            console.error('❌ Error:', e);
        }
    }
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Forsale AI READY!');
    console.log('Try clicking the login button now!');
    console.log('═══════════════════════════════════════');
});
