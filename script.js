const API_BASE_URL = "https://pi-forsale.vercel.app/api";
let currentUser = null;

// 1. Initialize Pi SDK immediately upon page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Pi.init({ version: "2.0", sandbox: false }); 
        console.log("✅ Pi SDK Initialized Successfully");
        setupEventListeners();
    } catch (err) {
        console.error("Pi Init Failed:", err);
        alert("Pi Network Initialization Error: " + err.message);
    }
});

// 2. Setup Event Listeners for Buttons
function setupEventListeners() {
    const loginBtn = document.getElementById('pi-login-btn');
    const buyBtn = document.getElementById('buy-btn'); 
    
    if (loginBtn) {
        // This ensures the button works by calling handlePiLogin
        loginBtn.addEventListener('click', handlePiLogin);
    }
    if (buyBtn) {
        buyBtn.addEventListener('click', startPayment);
    }
}

// 3. Handle Login (The function where onIncompletePaymentFound is triggered)
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        // 🚨 CRITICAL: Pi.authenticate will automatically call onIncompletePaymentFound 
        // if a pending payment exists.
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        currentUser = auth.user;
        console.log("Logged in user:", currentUser.username);

        // UI Update: Hide Login, Show App
        const authContainer = document.getElementById('auth-container');
        const appContainer = document.getElementById('app-container');
        
        if(authContainer) authContainer.style.display = 'none';
        if(appContainer) appContainer.style.display = 'block';

    } catch (err) {
        console.error("Login Error:", err);
        alert("Login Failed: " + err.message);
    }
}

// 4. Handle Pending/Incomplete Payments (THE CORE FIX)
function onIncompletePaymentFound(payment) {
    console.log("Handling Incomplete Payment:", payment.identifier);
    
    // Attempt to restart the payment process with the existing payment object
    return Pi.createPayment(payment, {
        onReadyForServerApproval: (paymentId) => { 
            // Use fetch to call backend
            fetch(`${API_BASE_URL}/payments/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, orderId: payment.metadata.order_id }) // Pass orderId if available
            }).then(res => res.json()).then(data => console.log("Incomplete Approved Result:", data));
        },
        onReadyForServerCompletion: (paymentId, txid) => { 
            // Use fetch to call backend
            fetch(`${API_BASE_URL}/payments/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, txid: txid })
            }).then(res => res.json()).then(data => console.log("Incomplete Completed Result:", data));
            alert("✅ Incomplete Payment Successfully Completed.");
        },
        onCancel: (paymentId) => { 
            console.log("Incomplete Payment Cancelled:", paymentId); 
            alert("Incomplete Payment has been cancelled.");
        },
        onError: (error, payment) => { 
            console.error("Error on Incomplete Payment:", error);
            alert("Error processing pending payment: " + error.message);
        }
    });
}

// 5. Handle New Payment (Used by buyBtn)
async function startPayment() {
    if (!currentUser) return alert("Please login first.");
    // ... (rest of the payment logic)
    alert("New payment logic called. This shouldn't be reached if a payment is pending.");
}

// --- Other AI/App functions follow here --- 
// (Ensure your startAiAnalysis and sendMessage functions are included)
