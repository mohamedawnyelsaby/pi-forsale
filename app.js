// Global Configuration
const USDRate = 30.00; // 1 Pi = $30.00 (Example Rate)
let isTestnet = true;
let isConnected = false;
let userBalance = 0.00; // Simulated balance
let cart = [];
let currentLanguage = 'ar';
let activeCategory = 'all';

// Product Data (The AI-Powered Marketplace Listings)
const productsData = [
    { id: 1, name: "شاحن لاسلكي ذكي (AI-Optimized)", name_en: "AI-Optimized Wireless Charger", price: 0.15, category: "electronics", rating: 4.9, ai_rating: 9.5, desc: "شاحن سريع بقدرة 15 واط، يتميز بخوارزميات ذكاء اصطناعي لتحسين كفاءة الشحن وعمر البطارية. (الشحن الآمن هو ميزة AI).", desc_en: "15W fast charger with AI algorithms to optimize charging efficiency and battery life. (Safe charging is the AI feature).", extra: "تاريخ الإصدار: 2025-01-01", img: "https://placehold.co/400x300/FFD400/000000?text=AI+Charger" },
    { id: 2, name: "منزل خشبي جاهز (Eco-Smart)", name_en: "Eco-Smart Prefab Wooden House", price: 120.00, category: "realestate", rating: 4.5, ai_rating: 8.8, desc: "منزل جاهز صديق للبيئة، مصمم لتركيب سريع ويتميز بكفاءة طاقة عالية.", desc_en: "Eco-friendly prefabricated house, designed for quick assembly and features high energy efficiency.", extra: "الحجم: 80 متر مربع", img: "https://placehold.co/400x300/4CAF50/FFFFFF?text=Eco+House" },
    { id: 3, name: "خدمة تصميم شعارات (Pro-AI)", name_en: "Pro-AI Logo Design Service", price: 0.05, category: "services", rating: 4.8, ai_rating: 9.2, desc: "تصميم شعار احترافي باستخدام أدوات الذكاء الاصطناعي لضمان تميز العلامة التجارية. تسليم خلال 24 ساعة.", desc_en: "Professional logo design using AI tools to ensure brand distinction. Delivery within 24 hours.", extra: "مراجعات غير محدودة", img: "https://placehold.co/400x300/007BFF/FFFFFF?text=Logo+Design" },
    { id: 4, name: "مفتاح سيارة ذكي (NFC Ready)", name_en: "Smart Car Key (NFC Ready)", price: 0.80, category: "electronics", rating: 4.2, ai_rating: 7.5, desc: "مفتاح سيارة ذكي يدعم خاصية NFC وبدء التشغيل عن بعد. متوافق مع معظم الموديلات الحديثة.", desc_en: "Smart car key supporting NFC and remote start. Compatible with most modern models.", extra: "البطارية تدوم لعامين", img: "https://placehold.co/400x300/800080/FFFFFF?text=Smart+Key" },
    { id: 5, name: "فيلا فاخرة (Mainnet Exclusive)", name_en: "Luxury Villa (Mainnet Exclusive)", price: 500.00, category: "realestate", rating: 5.0, ai_rating: 9.9, desc: "فيلا فاخرة بموقع متميز. الدفع متاح فقط على Mainnet (الدفع الضامن).", desc_en: "Luxury villa in a prime location. Payment is only available on Mainnet (Escrow Payment).", extra: "الموقع: دبي - جميرا", img: "https://placehold.co/400x300/FF0000/FFFFFF?text=Luxury+Villa" },
    { id: 6, name: "اشتراك عام لمنصة AI", name_en: "AI Platform Annual Subscription", price: 1.50, category: "services", rating: 4.6, ai_rating: 9.1, desc: "اشتراك لمدة عام كامل في منصة متقدمة لإنشاء المحتوى المدعوم بالذكاء الاصطناعي.", desc_en: "One-year subscription to an advanced AI-powered content creation platform.", extra: "100000 نقطة AI شهريًا", img: "https://placehold.co/400x300/FFA500/000000?text=AI+Subscription" },
    { id: 7, name: "ماكينة قهوة رقمية", name_en: "Digital Coffee Machine", price: 0.30, category: "electronics", rating: 4.7, ai_rating: 8.0, desc: "ماكينة قهوة يمكن التحكم بها عبر تطبيق الهاتف، تدعم الإعداد المسبق للاستيقاظ.", desc_en: "Coffee machine controllable via mobile app, supports preset wake-up brewing.", extra: "الضمان: سنتان", img: "https://placehold.co/400x300/607D8B/FFFFFF?text=Coffee+Machine" },
    { id: 8, name: "أرض زراعية خصبة", name_en: "Fertile Agricultural Land", price: 80.00, category: "realestate", rating: 4.4, ai_rating: 7.0, desc: "أرض زراعية بموقع جيد، متوفرة للبيع بالكامل عبر Pi Network.", desc_en: "Agricultural land in a good location, available for full sale via Pi Network.", extra: "المساحة: 5000 متر مربع", img: "https://placehold.co/400x300/8BC34A/000000?text=Land" },
];

// --------------------------------------------------------------------------------
// --- Utility Functions ---
// --------------------------------------------------------------------------------

// Helper for formatting currency
const formatPi = (amount) => {
    return parseFloat(amount).toFixed(2);
};

// Helper for showing temporary messages
const showToast = (message) => {
    const toast = document.getElementById('toast');
    toast.innerHTML = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
};

// Helper for logging events
const logEvent = (message, type = 'info') => {
    const log = document.getElementById('txLog');
    const now = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--success)' : 'var(--muted)';
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-info-circle';
    
    const logEntry = document.createElement('div');
    logEntry.style.color = color;
    logEntry.innerHTML = `<i class="fa-solid ${icon}" style="margin-left: 5px;"></i> ${message} <span style="font-size: 10px; color: var(--muted); display: block; text-align: left;">[${now}]</span>`;
    
    // Arabic RTL adjustment
    if (currentLanguage === 'ar') {
         logEntry.style.textAlign = 'right';
         logEntry.innerHTML = `<i class="fa-solid ${icon}" style="margin-right: 5px;"></i> ${message} <span style="font-size: 10px; color: var(--muted); display: block; text-align: left;">[${now}]</span>`;
    }

    log.prepend(logEntry); // Add to the top
};

const clearLogs = () => {
    document.getElementById('txLog').innerHTML = '';
    logEvent(currentLanguage === 'ar' ? "تم مسح سجل الأحداث." : "Event log cleared.", 'info');
}

// --------------------------------------------------------------------------------
// --- Pi Network SDK Functions (The Core of the App) ---
// --------------------------------------------------------------------------------

// 1. Connection (Authentication)
const piConnect = () => {
    if (isConnected) {
        logEvent(currentLanguage === 'ar' ? "أنت بالفعل متصل بشبكة Pi." : "You are already connected to the Pi Network.", 'info');
        return;
    }
    
    logEvent(currentLanguage === 'ar' ? "جاري محاولة الاتصال بشبكة Pi..." : "Attempting to connect to Pi Network...", 'info');
    document.getElementById('loadingBar').style.opacity = '1';

    // The Pi.authenticate() function
    try {
        Pi.authenticate(["username", "payments"], (auth) => {
            // This runs on successful connection
            isConnected = true;
            document.getElementById('loadingBar').style.opacity = '0';
            const username = auth.user.username;
            
            // Set the simulated balance for demonstration
            userBalance = isTestnet ? 10.00 : 0.00; 

            // Update UI
            document.querySelector('.username-text').textContent = username;
            document.getElementById('statusIcon').className = 'fa-solid fa-circle-check';
            document.getElementById('statusIcon').title = 'Connected';
            
            updateBalanceUI();
            updateCheckoutButton();
            
            showToast(currentLanguage === 'ar' ? `مرحباً، ${username}! تم الاتصال بنجاح.` : `Welcome, ${username}! Connection successful.`);
            logEvent(currentLanguage === 'ar' ? `تم الاتصال بنجاح. المستخدم: ${username}` : `Successfully connected. User: ${username}`, 'success');
            
        }, (error) => {
            // This runs on failure
            document.getElementById('loadingBar').style.opacity = '0';
            logEvent(currentLanguage === 'ar' ? `فشل الاتصال: ${error.message || error}` : `Connection failed: ${error.message || error}`, 'error');
            alert(currentLanguage === 'ar' ? "فشل الاتصال. تأكد أنك في Pi Browser." : "Connection failed. Ensure you are in the Pi Browser.");
        });
    } catch (error) {
         // Fallback for non-Pi Browser environment (CodePen/Chrome)
         document.getElementById('loadingBar').style.opacity = '0';
         logEvent(currentLanguage === 'ar' ? "وظيفة Pi SDK غير متاحة. سيتم استخدام المحاكاة." : "Pi SDK not available. Using Mocking.", 'info');
         
         // Mocking successful connection for demonstration
         isConnected = true;
         const mockUser = "MockUser123";
         userBalance = isTestnet ? 10.00 : 0.00; 
         
         document.querySelector('.username-text').textContent = mockUser;
         document.getElementById('statusIcon').className = 'fa-solid fa-circle-check';
         document.getElementById('statusIcon').title = 'Connected (Mock)';
         updateBalanceUI();
         updateCheckoutButton();
         
         showToast(currentLanguage === 'ar' ? `(محاكاة) مرحباً، ${mockUser}! تم الاتصال بنجاح.` : `(Mock) Welcome, ${mockUser}! Connection successful.`);
    }
};

// 2. Checkout (Payment)
const piCheckout = () => {
    if (!isConnected) {
        showToast(currentLanguage === 'ar' ? "الرجاء الاتصال أولاً بشبكة Pi." : "Please connect to Pi Network first.", 'error');
        return;
    }
    if (cart.length === 0) {
        showToast(currentLanguage === 'ar' ? "سلة التسوق فارغة." : "Your cart is empty.", 'error');
        return;
    }

    const totalPi = cart.reduce((sum, item) => sum + item.price, 0);
    const paymentData = {
        amount: totalPi.toFixed(2),
        memo: `Purchase from Forsale: ${cart.map(i => i.name_en).join(', ')}`,
        metadata: {
            app_id: "ForsaleMarketplace",
            items: cart.map(item => ({ id: item.id, quantity: item.qty }))
        }
    };
    
    // Determine payment type based on the network
    const isEscrow = !isTestnet && totalPi >= 10.00; // Example: Escrow for large Mainnet purchases
    const paymentTitle = isEscrow ? 
        (currentLanguage === 'ar' ? "دفع ضامن (Mainnet)" : "Escrow Payment (Mainnet)") :
        (currentLanguage === 'ar' ? "دفع مباشر" : "Direct Payment");

    logEvent(currentLanguage === 'ar' ? 
        `جاري بدء عملية الدفع (${paymentTitle}) بمبلغ: ${paymentData.amount} Pi` : 
        `Starting payment process (${paymentTitle}) for: ${paymentData.amount} Pi`, 'info');
    document.getElementById('loadingBar').style.opacity = '1';

    try {
         // The Pi.openPaymentDialog() function
        Pi.openPaymentDialog(paymentData, (payment) => {
            // Payment completed successfully
            document.getElementById('loadingBar').style.opacity = '0';
            const txId = payment.identifier.substring(0, 8); // Shorten for UI
            
            // Successful payment simulation: Clear cart, update balance
            cart = [];
            if (isTestnet) {
                 userBalance -= totalPi;
                 updateBalanceUI();
            }

            renderCart();
            updateCheckoutButton();
            
            showToast(currentLanguage === 'ar' ? "تم الدفع بنجاح! سيتم شحن طلبك قريباً." : "Payment successful! Your order will be shipped soon.", 'success');
            logEvent(currentLanguage === 'ar' ? 
                `نجاح الدفع (${txId}). تم استلام: ${paymentData.amount} Pi.` : 
                `Payment success (${txId}). Received: ${paymentData.amount} Pi.`, 'success');
            
        }, (error) => {
            // Payment failed or was cancelled
            document.getElementById('loadingBar').style.opacity = '0';
            logEvent(currentLanguage === 'ar' ? `فشل أو إلغاء عملية الدفع: ${error.message || error}` : `Payment failed or cancelled: ${error.message || error}`, 'error');
            
        }, {
             // Optional: Set the payment type (if needed for advanced features)
             type: isEscrow ? 'escrow' : 'standard' 
        });
    } catch (error) {
        // Fallback for non-Pi Browser environment (CodePen/Chrome)
        document.getElementById('loadingBar').style.opacity = '0';
        logEvent(currentLanguage === 'ar' ? "فشل فتح نافذة الدفع. سيتم استخدام محاكاة النجاح." : "Failed to open payment dialog. Using success mocking.", 'error');

        // Mocking successful payment for demonstration
        setTimeout(() => {
            cart = [];
            if (isTestnet) {
                 userBalance -= totalPi;
                 updateBalanceUI();
            }
            renderCart();
            updateCheckoutButton();
            
            showToast(currentLanguage === 'ar' ? "(محاكاة) تم الدفع بنجاح!" : "(Mock) Payment successful!", 'success');
            logEvent(currentLanguage === 'ar' ? `(محاكاة) نجاح الدفع بمبلغ: ${paymentData.amount} Pi` : `(Mock) Payment success for: ${paymentData.amount} Pi`, 'success');
        }, 1500); 
    }
};

// 3. Network Toggle
const toggleNetwork = () => {
    isTestnet = !isTestnet;
    document.getElementById('netBtn').textContent = isTestnet ? 'Testnet' : 'Mainnet';
    document.getElementById('netBtn').style.backgroundColor = isTestnet ? 'var(--accent)' : 'var(--error)';
    
    // Update labels
    updateUILanguage(currentLanguage);

    // Update balance and status (simulate switch)
    userBalance = isTestnet ? 10.00 : 0.00; 
    updateBalanceUI();
    updateCheckoutButton(); 

    logEvent(currentLanguage === 'ar' ? 
        `تم التبديل إلى شبكة: ${isTestnet ? 'Testnet' : 'Mainnet'}` : 
        `Switched to network: ${isTestnet ? 'Testnet' : 'Mainnet'}`, 'info');
    
    showToast(currentLanguage === 'ar' ? 
        `تم التبديل إلى ${isTestnet ? 'Testnet' : 'Mainnet'}.` : 
        `Switched to ${isTestnet ? 'Testnet' : 'Mainnet'}.`);
};

// --------------------------------------------------------------------------------
// --- UI Rendering and Handlers ---
// --------------------------------------------------------------------------------

// Renders product categories
const renderCategories = () => {
    const categories = ['all', ...new Set(productsData.map(p => p.category))];
    const catMenu = document.getElementById('cats');
    catMenu.innerHTML = '';

    const labels = {
        all: { ar: "الكل", en: "All" },
        electronics: { ar: "إلكترونيات", en: "Electronics" },
        realestate: { ar: "عقارات", en: "Real Estate" },
        services: { ar: "خدمات", en: "Services" }
    };

    categories.forEach(cat => {
        const catName = labels[cat] ? labels[cat][currentLanguage] : cat;
        const div = document.createElement('div');
        div.className = `cat ${cat === activeCategory ? 'active' : ''}`;
        div.textContent = catName;
        div.setAttribute('data-category', cat);
        div.onclick = () => filterByCategory(cat);
        catMenu.appendChild(div);
    });
};

// Filters products by category
const filterByCategory = (category) => {
    activeCategory = category;
    renderCategories(); // Re-render to highlight active category
    renderProducts(productsData.filter(p => category === 'all' || p.category === category));
};

// Renders product listings
const renderProducts = (products) => {
    const list = document.getElementById('productList');
    list.innerHTML = '';

    products.forEach(p => {
        const name = p[currentLanguage === 'ar' ? 'name' : 'name_en'];
        const desc = p[currentLanguage === 'ar' ? 'desc' : 'desc_en'];

        const productDiv = document.createElement('div');
        productDiv.className = `product ${p.ai_rating >= 9.0 ? 'ai-pick' : ''}`;
        productDiv.setAttribute('data-id', p.id);
        productDiv.onclick = () => openProductModal(p.id);

        productDiv.innerHTML = `
            ${p.ai_rating >= 9.0 ? `<div class="ai-badge">${currentLanguage === 'ar' ? 'اختيار AI' : 'AI Pick'}</div>` : ''}
            <img src="${p.img}" alt="${name}">
            <div class="product-content">
                <div class="title">${name}</div>
                <div class="desc">${desc}</div>
                <div class="seller-rating">${currentLanguage === 'ar' ? 'تقييم' : 'Rating'}: ${p.rating} <i class="fa-solid fa-star"></i></div>
            </div>
            <div class="price-row">
                <div class="price">${formatPi(p.price)} Pi</div>
                <div class="usd-value">(~ $${formatPi(p.price * USDRate)})</div>
            </div>
        `;
        list.appendChild(productDiv);
    });

    if (products.length === 0) {
        list.innerHTML = `<p style="color: var(--muted); text-align: center; margin-top: 50px;">${currentLanguage === 'ar' ? "لا توجد منتجات مطابقة للمعايير المحددة." : "No products match the selected criteria."}</p>`;
    }
};

// Handles sorting logic
const handleSortChange = (sortType) => {
    let sortedProducts = [...productsData];
    
    switch (sortType) {
        case 'rating_desc':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'price_asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'default':
        default:
            // Sort by AI rating then by default ID
            sortedProducts.sort((a, b) => b.ai_rating - a.ai_rating || a.id - b.id);
            break;
    }

    // Apply active category filter before rendering
    const filteredProducts = sortedProducts.filter(p => activeCategory === 'all' || p.category === activeCategory);
    renderProducts(filteredProducts);
};

// Renders cart contents
const renderCart = () => {
    const cartArea = document.getElementById('cartArea');
    const cartTotalDiv = document.getElementById('cartTotal');
    cartArea.innerHTML = '';
    
    let totalPi = 0;

    if (cart.length === 0) {
        cartArea.innerHTML = `<p style="color: var(--muted); text-align: center; padding: 20px 0;">${currentLanguage === 'ar' ? "السلة فارغة." : "Cart is empty."}</p>`;
        totalPi = 0;
    } else {
        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.marginBottom = '10px';
            itemDiv.style.padding: '8px';
            itemDiv.style.backgroundColor = 'var(--secondary)';
            itemDiv.style.borderRadius = '6px';
            
            const name = item[currentLanguage === 'ar' ? 'name' : 'name_en'];

            itemDiv.innerHTML = `
                <div style="flex-grow: 1;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: var(--text-light);">${name}</p>
                    <p style="margin: 0; font-size: 12px; color: var(--primary);">${formatPi(item.price)} Pi</p>
                </div>
                <button class="cart-remove-btn" onclick="removeFromCart(${item.id})" style="padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            cartArea.appendChild(itemDiv);
            totalPi += item.price;
        });
    }

    // Update total display
    const totalUSD = totalPi * USDRate;
    cartTotalDiv.querySelector('.total-pi').textContent = `${currentLanguage === 'ar' ? 'المجموع' : 'Total'}: ${formatPi(totalPi)} Pi`;
    cartTotalDiv.querySelector('.total-usd').textContent = `(~ $${formatPi(totalUSD)})`;
    
    updateCheckoutButton();
};

// Adds item to cart
const addToCart = (productId) => {
    const product = productsData.find(p => p.id === productId);
    if (product) {
        cart.push(product); // Simplified: always add a new instance (no quantity)
        renderCart();
        showToast(currentLanguage === 'ar' ? "تمت الإضافة إلى السلة بنجاح!" : "Added to cart successfully!");
        logEvent(currentLanguage === 'ar' ? `تم إضافة: ${product.name} إلى السلة.` : `Added: ${product.name_en} to cart.`, 'info');
    }
};

// Removes item from cart (simple removal of the first match)
const removeFromCart = (productId) => {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        renderCart();
        showToast(currentLanguage === 'ar' ? "تم حذف العنصر من السلة." : "Item removed from cart.", 'info');
        logEvent(currentLanguage === 'ar' ? `تم حذف: ${removedItem.name} من السلة.` : `Removed: ${removedItem.name_en} from cart.`, 'info');
    }
};

// Opens product detail modal
const openProductModal = (productId) => {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const name = product[currentLanguage === 'ar' ? 'name' : 'name_en'];
    const desc = product[currentLanguage === 'ar' ? 'desc' : 'desc_en'];
    const extraLabel = currentLanguage === 'ar' ? 'تفاصيل إضافية' : 'Extra Details';

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDesc').textContent = desc;
    document.getElementById('modalImg').src = product.img;
    document.getElementById('modalPrice').textContent = `${formatPi(product.price)} Pi`;
    document.getElementById('modalUSD').textContent = `(~ $${formatPi(product.price * USDRate)})`;
    document.getElementById('modalSellerRating').innerHTML = `${currentLanguage === 'ar' ? 'تقييم البائع' : 'Seller Rating'}: ${product.rating} <i class="fa-solid fa-star"></i>`;
    document.getElementById('modalExtra').textContent = `${extraLabel}: ${product.extra}`;
    
    // Set data for the add button
    document.getElementById('modalAdd').setAttribute('data-product-id', productId);
    
    openModal('productModal');
};

// General modal handler
const openModal = (id) => {
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden';
};

const closeModal = (id) => {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = 'auto';
};

// Handles adding from modal
const handleModalAdd = (button) => {
    const productId = parseInt(button.getAttribute('data-product-id'));
    addToCart(productId);
    closeModal('productModal');
};

// Handles the AI Search button
const handleAISearch = () => {
    const input = document.getElementById('search-input').value.toLowerCase();
    if (!input) {
        filterByCategory(activeCategory); // Re-render current category if search is empty
        return;
    }
    
    logEvent(currentLanguage === 'ar' ? `بدء البحث الذكي عن: "${input}"` : `Starting AI search for: "${input}"`, 'info');

    // Simple AI/Smart Search Simulation: Filter by name, desc, or category
    const results = productsData.filter(p => {
        const arName = p.name.toLowerCase();
        const enName = p.name_en.toLowerCase();
        const arDesc = p.desc.toLowerCase();
        const enDesc = p.desc_en.toLowerCase();
        const category = p.category.toLowerCase();

        return arName.includes(input) || enName.includes(input) ||
               arDesc.includes(input) || enDesc.includes(input) ||
               category.includes(input);
    });

    renderProducts(results);
    logEvent(currentLanguage === 'ar' ? `نتائج البحث: ${results.length} منتج.` : `Search results: ${results.length} products.`, 'info');
};

// Updates Pi balance display
const updateBalanceUI = () => {
    const balanceElement = document.querySelector('.balance-text');
    if (isConnected) {
        balanceElement.textContent = `${currentLanguage === 'ar' ? 'رصيدك (مُحاكى)' : 'Your Balance (Mock)'}: ${formatPi(userBalance)} Pi`;
    } else {
        balanceElement.textContent = currentLanguage === 'ar' ? "الرجاء الاتصال لعرض الرصيد" : "Please connect to view balance";
    }
};

// Updates checkout button text and status
const updateCheckoutButton = () => {
    const btn = document.getElementById('checkoutBtn');
    const totalPi = cart.reduce((sum, item) => sum + item.price, 0);
    const isEscrow = !isTestnet && totalPi >= 10.00; // Escrow logic example
    
    if (cart.length > 0 && isConnected) {
        btn.disabled = false;
        if (isTestnet) {
             btn.textContent = currentLanguage === 'ar' ? "دفع (Testnet)" : "Pay (Testnet)";
        } else {
            btn.textContent = isEscrow ? 
                (currentLanguage === 'ar' ? "دفع ضامن (Mainnet)" : "Escrow Pay (Mainnet)") : 
                (currentLanguage === 'ar' ? "دفع (Mainnet)" : "Pay (Mainnet)");
        }
        btn.style.backgroundColor = isEscrow ? '#FF8C00' : 'var(--success)'; // Orange for Escrow
    } else {
        btn.disabled = true;
        btn.textContent = currentLanguage === 'ar' ? "دفع (غير متاح)" : "Checkout (Unavailable)";
        btn.style.backgroundColor = 'var(--muted)';
    }
};

// --------------------------------------------------------------------------------
// --- Logy AI Assistant Logic ---
// --------------------------------------------------------------------------------

const logyResponses = {
    'shipping': { ar: "الشحن يستغرق عادةً من 5 إلى 7 أيام عمل داخل المنطقة. قد يتأخر الشحن الدولي.", en: "Shipping usually takes 5-7 business days within the region. International shipping may take longer." },
    'dispute': { ar: "لتقديم نزاع، يرجى تزويدي برقم معاملة Pi (TX ID) وسأقوم برفع الشكوى إلى قسم الدعم.", en: "To file a dispute, please provide me with the Pi transaction ID (TX ID) and I will escalate the complaint to the support department." },
    'recommendation': { ar: "بناءً على مشترياتك السابقة، أوصي بمراجعة المنتجات التي تحمل علامة 'اختيار AI' (AI Pick) في قسم الإلكترونيات.", en: "Based on your past purchases, I recommend checking out the 'AI Pick' products in the Electronics category." },
    'default': { ar: "أهلاً! أنا Logy مساعد الذكاء الاصطناعي. كيف يمكنني مساعدتك بخصوص الشحن، النزاعات، أو التوصيات؟", en: "Hello! I'm Logy, the AI assistant. How can I help you with shipping, disputes, or recommendations?" }
};

// Handles chat messages to Logy AI
const sendLogyMessage = () => {
    const inputElement = document.getElementById('logyInput');
    const message = inputElement.value.trim();
    if (!message) return;

    appendLogyMessage(message, 'user');
    inputElement.value = '';
    
    document.getElementById('logyStatus').textContent = currentLanguage === 'ar' ? "Logy جاري الكتابة..." : "Logy is typing...";

    // Simulate AI thinking time
    setTimeout(() => {
        let responseKey = 'default';
        const lowerCaseMsg = message.toLowerCase();

        if (lowerCaseMsg.includes(currentLanguage === 'ar' ? 'شحن' : 'shipping')) {
            responseKey = 'shipping';
        } else if (lowerCaseMsg.includes(currentLanguage === 'ar' ? 'نزاع' : 'dispute') || lowerCaseMsg.includes('مشكلة')) {
            responseKey = 'dispute';
        } else if (lowerCaseMsg.includes(currentLanguage === 'ar' ? 'توصية' : 'recommend')) {
            responseKey = 'recommendation';
        } else if (lowerCaseMsg.includes('hello') || lowerCaseMsg.includes('hi') || lowerCaseMsg.includes('مرحبا') || lowerCaseMsg.includes('أهلاً')) {
             // Keep default response
        }
        
        const response = logyResponses[responseKey][currentLanguage];
        appendLogyMessage(response, 'ai');
        document.getElementById('logyStatus').textContent = currentLanguage === 'ar' ? "Logy جاهز." : "Logy is ready.";
    }, 1500);
};

// Appends message to Logy chat window
const appendLogyMessage = (message, sender) => {
    const body = document.getElementById('logyBody');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = message;
    body.appendChild(bubble);
    
    // Scroll to the bottom
    body.scrollTop = body.scrollHeight;
};

// Handles opening Logy modal from product detail
const handleModalChat = (productId) => {
    const product = productsData.find(p => p.id === parseInt(productId));
    const name = product[currentLanguage === 'ar' ? 'name' : 'name_en'];
    
    closeModal('productModal'); 
    openModal('logyModal');
    
    document.getElementById('logyBody').innerHTML = ''; // Clear previous chat
    document.getElementById('logyStatus').textContent = currentLanguage === 'ar' ? "Logy جاهز." : "Logy is ready.";

    const initialMsg = currentLanguage === 'ar' ? 
        `أهلاً بك. ما هي تفاصيل الشحن أو الضمان التي تود معرفتها عن المنتج: ${name}؟` :
        `Hello. What shipping or warranty details would you like to know about the product: ${name}?`;
        
    appendLogyMessage(logyResponses['default'][currentLanguage], 'ai');
    appendLogyMessage(initialMsg, 'ai');
};


// --------------------------------------------------------------------------------
// --- Language (RTL/LTR) Handling ---
// --------------------------------------------------------------------------------

const toggleLanguage = () => {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    updateUILanguage(currentLanguage);
    showToast(currentLanguage === 'ar' ? "تم تغيير اللغة إلى العربية." : "Language changed to English.");
};

const updateUILanguage = (lang) => {
    const isArabic = lang === 'ar';
    document.documentElement.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
    document.getElementById('langToggleTop').textContent = isArabic ? 'EN' : 'AR';
    
    // Update elements with data-ar/data-en attributes
    document.querySelectorAll('[data-ar]').forEach(el => {
        el.textContent = isArabic ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        if (el.placeholder) {
            el.placeholder = isArabic ? el.getAttribute('data-ar') : el.getAttribute('data-en');
        }
    });

    // Re-render components to apply new language strings
    renderCategories();
    handleSortChange(document.getElementById('sortSelect').value);
    renderCart();
    updateBalanceUI();
    updateCheckoutButton();
};

// --------------------------------------------------------------------------------
// --- Initialization ---
// --------------------------------------------------------------------------------

const initApp = () => {
    // Check if running in Pi Browser (for debugging assistance)
    if (typeof Pi !== 'undefined') {
        logEvent(currentLanguage === 'ar' ? "تم اكتشاف Pi SDK. التطبيق يعمل في بيئة Pi." : "Pi SDK detected. App running in Pi environment.", 'info');
    } else {
        logEvent(currentLanguage === 'ar' ? "Pi SDK غير متوفر. التطبيق يعمل في بيئة محاكاة." : "Pi SDK unavailable. App running in mock environment.", 'info');
    }

    // Default load
    updateUILanguage(currentLanguage);
    
    // Set initial network state
    document.getElementById('netBtn').textContent = isTestnet ? 'Testnet' : 'Mainnet';
    document.getElementById('netBtn').style.backgroundColor = isTestnet ? 'var(--accent)' : 'var(--error)';

    // Initial render of products (default sort)
    handleSortChange('default');
    
    // Listen for Enter key in search box
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAISearch();
        }
    });

    // Listen for Enter key in Logy chat
    document.getElementById('logyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendLogyMessage();
        }
    });
};

// Start the application when the window loads
window.onload = initApp;
