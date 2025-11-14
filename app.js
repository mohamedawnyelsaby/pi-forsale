// Global Configuration (Example Rate)
const USDRate = 30.00; // Example: 1 Pi = $30.00 (This is NOT a real-time rate)
// *** [START] التغيير هنا: تم إضافة رابط الخادم الخلفي الجديد من Vercel ***
const BACKEND_URL = "https://forsale-backend.vercel.app"; // تأكد من أن هذا هو رابط النطاق الخاص بك
// *** [END] التغيير هنا ***


// --- DOM Elements ---
const connectBtn = document.getElementById('connect-btn');
const piStatusText = document.getElementById('pi-network-status-text');
const headerPiStatus = document.getElementById('pi-status');
const checkoutBtn = document.getElementById('checkout-btn');
const piTotalElement = document.getElementById('pi-total');
const usdTotalElement = document.getElementById('usd-total');
const productsContainer = document.getElementById('products-container');
const logOutput = document.getElementById('log-output');

// --- Global State ---
let userIsAuthenticated = false;
let shoppingCart = {};

// --- Logging Function ---
function log(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    logOutput.innerHTML += `<p class="${type}">[${time}] ${message}</p>`;
    logOutput.scrollTop = logOutput.scrollHeight;
}

// --- Cart Logic ---
function updateCart() {
    let piTotal = 0;
    // Calculate total Pi from items in the cart
    for (const piPrice of Object.values(shoppingCart)) {
        piTotal += piPrice;
    }
    const usdTotal = piTotal * USDRate;

    piTotalElement.textContent = piTotal.toFixed(2);
    usdTotalElement.textContent = usdTotal.toFixed(2);

    // Enable checkout button only if user is connected AND cart has items
    if (userIsAuthenticated && piTotal > 0) {
        checkoutBtn.disabled = false;
    } else {
        checkoutBtn.disabled = true;
    }
}

// --- Pi Network SDK Functions ---

// 1. Authenticate the User
async function handleConnect() {
    if (userIsAuthenticated) return;

    try {
        log('Attempting Pi authentication...');
        // Pi.authenticate requests username scope and calls onAuth on success
        const authData = await Pi.authenticate(['username'], onAuth);
        
        log(`Authentication successful. User: ${authData.user.username}`, 'success');
        
        userIsAuthenticated = true;
        piStatusText.textContent = 'متصل';
        headerPiStatus.textContent = 'متصل';
        headerPiStatus.classList.replace('status-disconnected', 'status-connected');
        connectBtn.textContent = 'متصل';
        connectBtn.disabled = true; // Disable connection button once connected
        updateCart(); // Check if cart can now be checked out
        
    } catch (error) {
        log(`Authentication failed: ${error.message}`, 'error');
        userIsAuthenticated = false;
    }
}

// 2. Open Payment Dialog (Testnet Example)
async function handleCheckout() {
    if (!userIsAuthenticated) {
        log('Error: User not authenticated. Please connect first.', 'error');
        return;
    }

    const amount = parseFloat(piTotalElement.textContent);
    const memo = `Forsale Purchase - ${new Date().toISOString()}`;

    try {
        log(`Initiating payment for ${amount} Pi...`);
        
        const payment = Pi.openPaymentDialog({
            amount: amount,
            memo: memo,
            metadata: {
                cart_items: JSON.stringify(shoppingCart)
            }
        }, onIncomplete, onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError);

    } catch (error) {
        log(`Payment initiation failed: ${error.message}`, 'error');
    }
}

// --- Payment Callbacks (محدثة للاتصال بالخادم الخلفي) ---

function onAuth(user, scopes) {
    log(`User ${user.username} successfully authenticated.`);
}

function onIncomplete(payment) {
    log(`Payment Incomplete/Awaiting Approval: TxID: ${payment.identifier}`, 'info');
}

// *** [START] التغيير هنا: الاتصال بالخادم الخلفي لتأكيد الدفع ***

async function onReadyForServerApproval(paymentId) {
    // في هذا التطبيق المبسط، سنتخطى خطوة الـ Approval وننتقل مباشرة إلى Completion
    log(`Payment Ready for Approval: ID: ${paymentId}`, 'info');
    log('Simulating immediate server approval...', 'success');
    // لا يوجد كود هنا، سيتم التعامل مع الإكمال في الدالة التالية
}

async function onReadyForServerCompletion(paymentId, txid) {
    log(`Payment Ready for Completion (TXID: ${txid}, ID: ${paymentId})`, 'info');
    log('Sending completion request to Vercel backend...', 'info');

    try {
        const response = await fetch(`${BACKEND_URL}/api/complete-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId, txid }),
        });

        const data = await response.json();

        if (data.success) {
            log(`Payment successfully confirmed by the Backend!`, 'success');
            log('Cart cleared. Transaction complete.', 'info');
            shoppingCart = {};
            updateCart();
        } else {
            log(`Backend Completion Failed: ${data.message}`, 'error');
        }
    } catch (error) {
        log(`Network Error: Could not connect to the backend server.`, 'error');
    }
}

// *** [END] التغيير هنا ***

function onCancel(paymentId) {
    log(`Payment cancelled by user. ID: ${paymentId}`, 'info');
}

function onError(error, payment) {
    log(`Payment Error: ${error}`, 'error');
}

// --- Event Listeners and Initialization ---

// Add to Cart Buttons
productsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const card = e.target.closest('.product-card');
        const piPrice = parseFloat(card.dataset.piPrice);
        const productName = card.querySelector('h3').textContent;
        
        // Simple cart: Key is product name, value is price
        if (shoppingCart[productName]) {
             shoppingCart[productName] += piPrice;
        } else {
             shoppingCart[productName] = piPrice;
        }
        
        log(`Added ${productName} (${piPrice} Pi) to cart.`, 'info');
        updateCart();
    }
});

// Checkout Button
checkoutBtn.addEventListener('click', handleCheckout);

// Connect Button
connectBtn.addEventListener('click', handleConnect);

// Clear Log Button
document.getElementById('clear-log-btn').addEventListener('click', () => {
    logOutput.innerHTML = '';
});

// Initial setup
log('Marketplace loaded. Waiting for Pi connection.');
updateCart();
