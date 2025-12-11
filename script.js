// ============================================
// 🤖 Forsale AI - Complete Frontend Logic
// Pi Network SDK Integration + AI Automation
// ============================================

// Configuration
const CONFIG = {
    API_URL: 'https://your-backend-url.com', // يجب تحديثه عند النشر
    PI_NETWORK_MODE: 'sandbox', // 'sandbox' or 'mainnet'
    AI_ENABLED: true,
    AUTO_TRANSLATE: true
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
        t: 'مرحباً! أنا Logy AI 🤖\n\nأنا مساعدك الشخصي الذكي في Forsale. أستطيع:\n\n✓ مساعدتك في البحث عن أي منتج\n✓ تحليل الأسعار وجودة المنتجات\n✓ متابعة طلباتك والشحن\n✓ حل أي مشاكل أو نزاعات\n✓ الإجابة عن أي سؤال\n\nكيف يمكنني مساعدتك اليوم؟ 😊' 
    }
];

// ============================================
// 1. Pi Network SDK Initialization
// ============================================

async function initializePiSDK() {
    try {
        piInstance = window.Pi;
        
        if (!piInstance) {
            console.error('❌ Pi SDK not loaded! Make sure you are using Pi Browser.');
            return false;
        }
        
        console.log('✅ Pi SDK initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Pi SDK:', error);
        return false;
    }
}

// ============================================
// 2. Pi Network Authentication
// ============================================

async function authenticateWithPi() {
    showLoading('جاري الاتصال بـ Pi Network...');
    
    try {
        const scopes = ['username', 'payments'];
        const authResult = await piInstance.authenticate(scopes, onIncompletePaymentFound);
        
        currentPiUser = authResult.user;
        
        console.log('✅ Pi Authentication successful:', currentPiUser);
        
        // Save user data
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
        
        // Send welcome message from Logy AI
        setTimeout(() => {
            addLogyMessage(`مرحباً ${currentPiUser.username}! 👋\n\nتم تسجيل دخولك بنجاح عبر Pi Network. حسابك مؤمن بالكامل.\n\nهل تريد مني أن أعرض لك أفضل العروض المتاحة اليوم؟`);
        }, 2000);
        
        return authResult;
        
    } catch (error) {
        console.error('❌ Pi Authentication failed:', error);
        hideLoading();
        alert('فشل تسجيل الدخول عبر Pi Network. تأكد من استخدام Pi Browser.');
        return null;
    }
}

// ============================================
// 3. Pi Network Payment Creation
// ============================================

async function createPiPayment(product) {
    if (!piInstance) {
        alert('Pi SDK غير محمّل. تأكد من استخدام Pi Browser.');
        return;
    }
    
    if (!currentPiUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }
    
    showLoading('جاري إنشاء طلب الدفع الآمن...');
    
    try {
        const paymentData = {
            amount: product.price,
            memo: `شراء: ${product.name}`,
            metadata: {
                productId: product.id,
                productName: product.name,
                buyerUid: currentPiUser.uid,
                buyerUsername: currentPiUser.username,
                timestamp: Date.now()
            }
        };
        
        const callbacks = {
            onReadyForServerApproval: function(paymentId) {
                console.log('📡 Payment ready for approval:', paymentId);
                hideLoading();
                approvePaymentOnServer(paymentId, product.id);
            },
            onReadyForServerCompletion: function(paymentId, txid) {
                console.log('📡 Payment ready for completion:', paymentId, txid);
                completePaymentOnServer(paymentId, txid, product.id);
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
        
        const payment = await piInstance.createPayment(paymentData, callbacks);
        
        console.log('✅ Payment created:', payment);
        
    } catch (error) {
        console.error('❌ Failed to create payment:', error);
        hideLoading();
        alert('فشل إنشاء طلب الدفع. حاول مرة أخرى.');
    }
}

// ============================================
// 4. Server API Calls
// ============================================

async function approvePaymentOnServer(paymentId, productId) {
    showLoading('Logy AI يراجع الطلب...');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/payment/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentId: paymentId,
                productId: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment approved on server');
            addLogyMessage('✅ تمت الموافقة على الدفع!\n\nLogy AI يراقب المعاملة الآن...');
        } else {
            console.error('❌ Server approval failed:', data.error);
            hideLoading();
            alert('فشلت الموافقة على الدفع');
        }
        
    } catch (error) {
        console.error('❌ Failed to approve payment:', error);
        hideLoading();
        alert('خطأ في الاتصال بالخادم');
    }
}

async function completePaymentOnServer(paymentId, txid, productId) {
    showLoading('Logy AI يكمل المعاملة...');
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/payment/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                paymentId: paymentId,
                txid: txid,
                productId: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Payment completed on server');
            hideLoading();
            
            // Show success message
            alert('🎉 تم الدفع بنجاح!\n\nLogy AI سيبدأ الآن:\n✓ إشعار البائع\n✓ ترتيب الشحن\n✓ مراقبة التوصيل');
            
            // Add AI message
            addLogyMessage(`🎉 تهانينا!\n\nتم شراء "${currentProduct.name}" بنجاح!\n\nالمبلغ: ${currentProduct.price.toLocaleString()} Pi\n\nLogy AI الآن:\n✓ أشعر البائع\n✓ رتب الشحن مع أفضل شركة\n✓ سيصلك تحديثات تلقائية\n\nالتوصيل المتوقع: 3-5 أيام عمل`);
            
            closeProductDetailModal();
            
            // Simulate AI shipping coordination
            setTimeout(() => {
                unreadNotifications++;
                updateNotificationDot();
                addLogyMessage('📦 تحديث الشحن:\n\nتم تأكيد الطلب من البائع!\nLogy AI اختار شركة الشحن الأمثل: DHL Express\n\nسيصلك رقم التتبع خلال ساعتين.');
            }, 5000);
            
        } else {
            console.error('❌ Server completion failed:', data.error);
            hideLoading();
            alert('فشل إكمال الدفع');
        }
        
    } catch (error) {
        console.error('❌ Failed to complete payment:', error);
        hideLoading();
        alert('خطأ في الاتصال بالخادم');
    }
}

function onIncompletePaymentFound(payment) {
    console.log('⚠️ Incomplete payment found:', payment);
    
    fetch(`${CONFIG.API_URL}/payment/incomplete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment })
    }).catch(err => console.error('Failed to process incomplete payment:', err));
}

// ============================================
// 5. UI Functions
// ============================================

function showLoading(text = 'جاري التحميل...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    if (overlay && loadingText) {
        loadingText.textContent = text;
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
// 6. Products Data (Enhanced with AI)
// ============================================

const CATEGORIES = [
    { id: 'all', name: 'الكل', icon: 'fa-layer-group', subs: [] },
    { 
        id: 'tech', 
        name: 'إلكترونيات', 
        icon: 'fa-laptop-code', 
        subs: [
            { id: 'mobile', name: 'هواتف وأجهزة لوحية' },
            { id: 'laptops', name: 'حواسيب محمولة' },
            { id: 'accs', name: 'إكسسوارات' }
        ] 
    },
    { 
        id: 'real', 
        name: 'عقارات', 
        icon: 'fa-building', 
        subs: [
            { id: 'apartments', name: 'شقق' },
            { id: 'villas', name: 'فيلات' },
            { id: 'land', name: 'أراضي' }
        ] 
    },
    { 
        id: 'fashion', 
        name: 'الأزياء', 
        icon: 'fa-shirt', 
        subs: [
            { id: 'clothes', name: 'ملابس' },
            { id: 'shoes', name: 'أحذية' },
            { id: 'jewel', name: 'مجوهرات' }
        ] 
    }
];

const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro (Titanium)',
        price: 105000,
        cat: 'tech',
        details: 'جهاز آيفون 15 برو مستعمل شهر واحد، حالة ممتازة (100% بدون خدوش)، تيتانيوم، 256GB. فحص AI: ممتاز.',
        img: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
        ai_analysis: {
            score: 9.2,
            market_price: 110000,
            summary: 'عرض ممتاز! السعر أقل من السوق بـ5%. Logy AI يوصي بالشراء الفوري.',
            price_state_color: '#00f2ff',
            confidence: 95
        },
        shipping_ai: {
            eta: '3-5 أيام عمل',
            problem_handling: 'مراقبة AI 24/7',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'أبل',
            'الموديل': 'آيفون 15 برو',
            'التخزين': '256 جيجا',
            'اللون': 'تيتانيوم',
            'البطارية': '98%',
            'الكاميرا': '48MP'
        }
    },
    {
        id: 'p2',
        name: 'MacBook Pro 2024 (M3 Max)',
        price: 155000,
        cat: 'tech',
        details: 'لابتوب احترافي جديد، M3 Max، 32GB RAM، 1TB SSD. مثالي للمصممين.',
        img: 'https://placehold.co/600x400/0a1128/FFD700?text=MacBook+Pro',
        ai_analysis: {
            score: 8.8,
            market_price: 155000,
            summary: 'السعر يطابق القيمة السوقية. جودة ممتازة.',
            price_state_color: '#FFD700',
            confidence: 92
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
            'التخزين': '1TB SSD',
            'الشاشة': '16 بوصة'
        }
    },
    {
        id: 'p3',
        name: 'فيلا مودرن بالرياض',
        price: 1500000,
        cat: 'real',
        details: 'فيلا فاخرة 500م²، 6 غرف، مسبح، حديقة. موقع راقٍ.',
        img: 'https://placehold.co/800x600/1a1a1a/2ECC71?text=Villa+Riyadh',
        ai_analysis: {
            score: 9.9,
            market_price: 1800000,
            summary: 'فرصة استثمارية! السعر أقل بـ17% من السوق. Logy AI ينصح بالتحرك الفوري.',
            price_state_color: '#2ECC71',
            confidence: 98
        },
        shipping_ai: {
            eta: 'تحويل ملكية خلال 14 يوم',
            problem_handling: 'مراجعة قانونية AI',
            carrier: 'Logy AI Legal'
        },
        specs: {
            'الموقع': 'شمال الرياض',
            'المساحة': '500 م²',
            'الغرف': '6',
            'الحالة': 'جديد',
            'المرافق': 'مسبح، حديقة'
        }
    },
    {
        id: 'p4',
        name: 'Samsung Galaxy S24 Ultra',
        price: 95000,
        cat: 'tech',
        details: 'جوال جديد، أعلى مواصفات، ذاكرة 512GB، كاميرا 200MP.',
        img: 'https://placehold.co/600x400/4A90E2/ffffff?text=Galaxy+S24',
        ai_analysis: {
            score: 8.5,
            market_price: 98000,
            summary: 'سعر جيد، أقل بـ3% من السوق.',
            price_state_color: '#4A90E2',
            confidence: 88
        },
        shipping_ai: {
            eta: '2-4 أيام',
            problem_handling: 'مراقبة AI 24/7',
            carrier: 'Logy AI Express'
        },
        specs: {
            'الماركة': 'سامسونج',
            'الموديل': 'Galaxy S24 Ultra',
            'التخزين': '512GB',
            'الكاميرا': '200MP',
            'البطارية': '5000mAh'
        }
    }
];

// ============================================
// 7. Rendering Functions
// ============================================

function renderCategories() {
    const container = document.getElementById('level1-scroll');
    container.innerHTML = CATEGORIES.map((c, i) => `
        <div class="cat-item ${i === 0 ? 'active' : ''}" onclick="selectCategory('${c.id}', this)">
            <i class="fa-solid ${c.icon}"></i> ${c.name}
        </div>
    `).join('');
}

function renderProducts(catId = 'all', subId = null) {
    let products = PRODUCTS;
    
    if (catId !== 'all') {
        products = products.filter(p => p.cat === catId);
    }
    
    // AI-powered sorting by default
    products.sort((a, b) => b.ai_analysis.score - a.ai_analysis.score);
    
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:50px 0;">لا توجد منتجات في هذا التصنيف حالياً.</p>';
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
    activeSub = null;
    
    renderProducts(activeCategory, activeSub);
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
    document.getElementById('shipping-problem').textContent = product.shipping_ai.problem_handling;
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

// ============================================
// 9. Purchase Flow
// ============================================

function initiatePurchase() {
    if (!currentProduct) return;
    
    if (currentPiUser) {
        // Use Pi Network payment
        createPiPayment(currentProduct);
    } else {
        // Show demo message
        alert(`🎉 شراء تجريبي!\n\nالمنتج: ${currentProduct.name}\nالسعر: ${currentProduct.price.toLocaleString()} Pi\n\nفي الإصدار الحقيقي:\n✓ سيتم الدفع عبر Pi Network\n✓ Logy AI سيدير كل شيء تلقائياً\n✓ ستتلقى تحديثات الشحن لحظياً`);
        
        closeProductDetailModal();
    }
}

// ============================================
// 10. Logy AI Chat
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
    
    // AI Response simulation
    setTimeout(() => {
        const response = generateAIResponse(text);
        logyMsgs.push({ s: 'ai', t: response });
        renderChat();
    }, 1500);
}

function generateAIResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('بحث') || msg.includes('منتج') || msg.includes('ابحث')) {
        return '🔍 بالتأكيد!\n\nاستخدم شريط البحث في الأعلى وصف المنتج بالتفصيل. مثلاً:\n"ابحث عن لابتوب قوي للتصميم بسعر أقل من 100,000 Pi"\n\nأنا سأحلل آلاف المنتجات وأعرض لك الأفضل!';
    }
    
    if (msg.includes('بيع') || msg.includes('إدراج') || msg.includes('منتج')) {
        return '📦 رائع! لبيع منتج:\n\n1. اضغط على أيقونة + في الأعلى\n2. صوّر المنتج من زوايا مختلفة\n3. أنا سأحلل الصور وأحدد:\n   ✓ المواصفات\n   ✓ الحالة\n   ✓ السعر الأمثل\n   ✓ أفضل فئة\n\nبعدها سأنشر منتجك عالمياً وأستهدف أفضل المشترين!';
    }
    
    if (msg.includes('شحن') || msg.includes('توصيل')) {
        return '🚚 أنا أدير الشحن بالكامل!\n\n✓ أختار أفضل شركة شحن (DHL, FedEx, etc)\n✓ أتفاوض على أفضل سعر\n✓ أراقب الشحنة لحظياً\n✓ أحل أي مشاكل فوراً\n✓ أضمن وصول المنتج بأمان\n\nأنت فقط استلم المنتج! 📦';
    }
    
    if (msg.includes('نزاع') || msg.includes('مشكلة') || msg.includes('شكوى')) {
        return '⚖️ أنا أحل جميع النزاعات تلقائياً!\n\nالعملية:\n1. تفتح نزاع وترفع أدلة (صور/فيديو)\n2. أنا أحلل الأدلة بالذكاء الاصطناعي\n3. أراجع سجل الشحن والمحادثات\n4. أصدر قرار عادل خلال 24-48 ساعة\n5. أنفذ القرار تلقائياً\n\nلا تدخل بشري = عدالة 100%';
    }
    
    if (msg.includes('سعر') || msg.includes('غالي') || msg.includes('رخيص')) {
        return '💰 تحليل الأسعار:\n\nأنا أحلل:\n✓ أسعار المنافسين\n✓ الطلب والعرض\n✓ حالة المنتج\n✓ الموقع الجغرافي\n✓ التوقيت\n\nلذلك جميع الأسعار على Forsale دقيقة وعادلة!\n\nإذا وجدت منتجاً أغلى من السوق، أخبرني وسأراجعه فوراً.';
    }
    
    if (msg.includes('عالمي') || msg.includes('دولي')) {
        return '🌍 نعم! Forsale AI عالمي تماماً:\n\n✓ المنتجات من جميع الدول\n✓ الشحن لأي مكان\n✓ دعم متعدد اللغات\n✓ تحويل العملات تلقائياً\n✓ حل النزاعات بأي لغة\n\nأنا أتعامل مع الجمارك والشحن الدولي بالكامل!';
    }
    
    if (msg.includes('امان') || msg.includes('ثقة') || msg.includes('احتيال')) {
        return '🛡️ الأمان مضمون 100%!\n\n✓ نظام Escrow (حجز المبلغ)\n✓ التحقق من البائعين\n✓ مراقبة AI للمنتجات\n✓ تأمين ضد الاحتيال\n✓ استرجاع كامل إذا لم يصل المنتج\n\nأنا أحمي المشترين والبائعين بالتساوي!';
    }
