// ===============================================
// main.js - Global Frontend Code (English)
// ===============================================

// --- Global Variables (Simplified) ---
let currentUser = null; 
let PRODUCTS = []; 
let logyMsgs = [
    { s: 'ai', t: 'Hello! I am Logy AI, your dedicated personal shopper and e-commerce manager. I handle all transactions and listings without human help. How can I assist you today?' }
];

// 🚨 Production API Base URL
const API_BASE_URL = 'https://pi-forsale.vercel.app/api'; 

// ============================================
// 1. API Helper Functions
// ============================================

/** Fetches the product list from the backend API. */
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
            const data = await response.json();
            PRODUCTS = data;
            // Assuming renderProducts() exists to display them
            // renderProducts(); 
        }
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }
}

/** Creates a new order entry on the backend before starting the Pi payment. */
async function createOrderOnBackend(productId, buyerId, price) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, buyerId, price })
    });
    return response.json();
}

/** Sends the paymentId to the backend for server-side approval. */
async function approvePaymentOnBackend(paymentId, orderId) {
    const response = await fetch(`${API_BASE_URL}/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, orderId })
    });
    return response.json();
}

// ============================================
// 2. Pi Network Payment Flow
// ============================================

/** Initiates the full checkout and Pi payment process. */
window.checkout = function() {
    // This should dynamically get the ID from the selected product
    const productId = 'p1'; 
    const product = PRODUCTS.find(p => p.id === productId); 
    if (!product) return alert('Product not found.');

    // closeCheckoutModal(); // Call your modal closing function

    if (typeof Pi !== 'undefined') {
        const buyerId = currentUser ? currentUser.id : 'guest_mock';
        
        // 1. Create Order on Backend (to get a unique Order ID)
        createOrderOnBackend(productId, buyerId, product.price).then(order => {
            if (!order || order.error) throw new Error('Failed to create order on backend.');
            
            // 2. Request Payment from Pi Network SDK
            Pi.requestPayment({
                amount: product.price,
                memo: `Purchase on Forsale AI: ${productId} - Order: ${order.id}`,
                metadata: {
                    order_id: order.id,
                    product_id: productId
                }
            }, (payment) => {
                // 3. Payment Authorized: Send Payment ID to Backend for Server Approval
                approvePaymentOnBackend(payment.identifier, order.id)
                    .then(res => {
                        if (res.success) {
                            alert('✅ Payment authorized successfully! Funds held in Escrow.');
                            // openOrdersModal(); // Call your orders modal function
                        } else {
                            alert('❌ Forsale Server failed to approve the payment.');
                        }
                    })
                    .catch(err => alert('❌ Error connecting to server after payment: ' + err.message));
                
            }, (error) => {
                alert('❌ Pi Network Payment failed: ' + error.message);
            });
        }).catch(err => alert('❌ Failed to create order: ' + err.message));

    } else {
        alert('Please open the application inside the Pi Browser to complete payment operations.');
    }
}


// ============================================
// 3. Logy AI Functions
// ============================================

/** Sends product data for AI analysis and listing. */
window.startAiAnalysis = async function() {
    const desc = document.getElementById('manual-desc').value.trim();
    const price = document.getElementById('manual-price').value.trim();
    const files = document.getElementById('product-images').files;

    if (!desc || files.length === 0) return alert('Please provide a description and at least one image.');

    const analysisBtn = document.getElementById('start-analysis-btn');
    analysisBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logy AI Analyzing & Listing...';
    analysisBtn.disabled = true;

    const payload = { 
        description: desc,
        price: price, 
        files: Array.from(files).map(f => ({ name: f.name, size: f.size }))
    };

    try {
        const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.success && data.product) {
            alert(`✅ Success! Product listed by Logy AI. Price: ${data.product.price.toLocaleString()} Pi.`);
            await fetchProducts(); 
        } else {
            alert(`❌ AI Analysis Failed: ${data.error || 'Unknown error.'}`);
        }
    } catch (error) {
        alert('❌ Error connecting to Logy AI Service: ' + error.message);
    } finally {
        setTimeout(() => {
            analysisBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Analyze & List Now by AI';
            analysisBtn.disabled = false;
            // closeAiUploadModal(); // Call your modal closing function
        }, 1000);
    }
};

/** Sends a message to the Logy AI Chatbot and receives a response. */
window.sendMessage = async function() {
    const input = document.getElementById('logy-input');
    const text = input.value.trim();
    if (text === '') return;

    logyMsgs.push({ s: 'user', t: text });
    input.value = '';
    // renderChat(); // Call your chat rendering function
    
    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();

        if (data.aiResponse) {
            logyMsgs.push({ s: 'ai', t: data.aiResponse });
        } else {
            logyMsgs.push({ s: 'ai', t: 'Error: Logy AI service unavailable.' });
        }
    } catch (error) {
        logyMsgs.push({ s: 'ai', t: 'Network error. Could not connect to the AI service.' });
        console.error('Chat error:', error);
    } finally {
        // renderChat(); // Call your chat rendering function
        // scrollToBottomOfChat(); // Call your scroll function
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Pi Authentication check (if needed)
    if (typeof Pi !== 'undefined') {
        Pi.authenticate(['username'], (user) => {
            currentUser = { id: user.uid, username: user.username };
        }, (error) => {
            console.error("Pi Authentication failed:", error);
        });
    }

    // Initialize the main product view
    fetchProducts();
    
    // Setup Enter key for Logy Chat
    const logyInput = document.getElementById('logy-input');
    if (logyInput) {
        logyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                sendMessage();
            }
        });
    }
});
