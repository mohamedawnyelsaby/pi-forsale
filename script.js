const API_BASE_URL = "https://pi-forsale.vercel.app/api";
let currentUser = null;

// 1. Initialize Pi SDK immediately upon page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Pi SDK (sandbox: false for Production/Mainnet)
        await Pi.init({ version: "2.0", sandbox: false });
        console.log("✅ Pi SDK Initialized Successfully");

        // Setup button listeners after successful init
        setupEventListeners();

    } catch (err) {
        console.error("Pi Init Failed:", err);
        alert("Error: " + err.message);
    }
});

// 2. Setup Event Listeners for Buttons
function setupEventListeners() {
    const loginBtn = document.getElementById('pi-login-btn');
    const buyBtn = document.getElementById('buy-btn'); 
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handlePiLogin);
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', startPayment);
    }
}

// 3. Handle Login
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        currentUser = auth.user;
        console.log("Logged in user:", currentUser);

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

// 4. Handle Payment
async function startPayment() {
    if (!currentUser) {
        alert("Please login first.");
        return;
    }

    try {
        // Create Payment Data
        const paymentData = {
            amount: 1, 
            memo: "Forsale AI Purchase", 
            metadata: { type: "digital_item" } 
        };

        // Call Pi SDK
        const payment = await Pi.createPayment(paymentData, {
            onReadyForServerApproval: async (paymentId) => {
                console.log("Payment ID:", paymentId);
                // Send to Backend for Approval
                await axios.post(`${API_BASE_URL}/payments/approve`, {
                    paymentId: paymentId
                });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                console.log("Completing Payment:", txid);
                // Send to Backend for Completion
                await axios.post(`${API_BASE_URL}/payments/complete`, {
                    paymentId: paymentId,
                    txid: txid
                });
                alert("✅ Payment Successful!");
            },
            onCancel: (paymentId) => { 
                console.log("Payment Cancelled", paymentId); 
            },
            onError: (error, payment) => { 
                console.error("Payment Error", error);
                alert("Payment Error: " + error.message);
            }
        });

    } catch (err) {
        console.error("Payment Init Error:", err);
        alert("Payment Failed: " + err.message);
    }
}

// 5. Handle Incomplete Payments
function onIncompletePaymentFound(payment) {
    console.log("Incomplete Payment Found:", payment);
    return Pi.createPayment(payment, {
        onReadyForServerApproval: (paymentId) => {
            axios.post(`${API_BASE_URL}/payments/approve`, { paymentId });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            axios.post(`${API_BASE_URL}/payments/complete`, { paymentId, txid });
        },
        onCancel: (paymentId) => { console.log("Cancelled", paymentId); },
        onError: (error, payment) => { console.error("Error", error); }
    });
}

// AI Analysis Function (Linked to HTML Button)
window.startAiAnalysis = async function() {
    const btn = document.getElementById('start-analysis-btn');
    if(btn) {
        btn.innerHTML = "Analyzing...";
        btn.disabled = true;
    }
    
    // Simulate AI delay
    setTimeout(() => {
        alert("AI Analysis Complete! Product Listed.");
        if(btn) {
            btn.innerHTML = "Analyze & List";
            btn.disabled = false;
        }
        // Close modal logic if needed
        const modal = document.getElementById('ai-upload-modal');
        if(modal) modal.style.display = 'none';
    }, 2000);
};

// Chat Function (Linked to HTML Button)
window.sendMessage = async function() {
    const input = document.getElementById('logy-input');
    if(input && input.value) {
        console.log("User sent:", input.value);
        input.value = "";
        // Here you would add the logic to display the message
    }
};
