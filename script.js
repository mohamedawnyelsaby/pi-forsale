const API_BASE_URL = "https://pi-forsale.vercel.app/api";
let currentUser = null;

// 1. Initialize Pi SDK and setup event listeners
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ensure Pi.init is the very first SDK call
        await Pi.init({ version: "2.0", sandbox: false }); 
        console.log("✅ Pi SDK Initialized Successfully");
        setupEventListeners();
    } catch (err) {
        console.error("Pi Init Failed:", err);
        alert("Pi Network Initialization Error: " + err.message);
    }
});

// 2. Setup Event Listeners
function setupEventListeners() {
    const loginBtn = document.getElementById('pi-login-btn');
    const buyBtn = document.getElementById('buy-btn'); 
    const analyzeBtn = document.getElementById('start-analysis-btn'); 
    const chatSendBtn = document.getElementById('send-message-btn'); 
    
    if (loginBtn) loginBtn.addEventListener('click', handlePiLogin);
    if (buyBtn) buyBtn.addEventListener('click', startPayment);
    // Assuming AI buttons are also linked via ID
    if (analyzeBtn) analyzeBtn.addEventListener('click', startAiAnalysis);
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);
}

// 3. Handle Login (Triggers the incomplete payment check)
async function handlePiLogin() {
    try {
        const scopes = ['username', 'payments'];
        // Pi.authenticate will automatically call onIncompletePaymentFound if pending payment exists
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

// 4. Handle Pending/Incomplete Payments (CRITICAL FIX: Uses native fetch)
function onIncompletePaymentFound(payment) {
    console.log("Handling Incomplete Payment:", payment.identifier);
    
    // Attempt to restart the payment process with the existing payment object
    return Pi.createPayment(payment, {
        onReadyForServerApproval: (paymentId) => { 
            fetch(`${API_BASE_URL}/payments/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId })
            }).then(res => res.json()).then(data => console.log("Incomplete Approved Result:", data))
              .catch(err => console.error("Incomplete Approve Fetch Error:", err));
        },
        onReadyForServerCompletion: (paymentId, txid) => { 
            fetch(`${API_BASE_URL}/payments/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: paymentId, txid: txid })
            }).then(res => res.json()).then(data => console.log("Incomplete Completed Result:", data))
              .catch(err => console.error("Incomplete Complete Fetch Error:", err));
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

// 5. Handle New Payment
async function startPayment() {
    if (!currentUser) return alert("Please login first.");

    try {
        const paymentData = {
            amount: 1, 
            memo: "New Pi Payment - Forsale AI", 
            metadata: { type: "digital_product" }
        };

        await Pi.createPayment(paymentData, {
            onReadyForServerApproval: async (paymentId) => {
                await fetch(`${API_BASE_URL}/payments/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: paymentId })
                }).then(res => res.json());
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
                await fetch(`${API_BASE_URL}/payments/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId: paymentId, txid: txid })
                }).then(res => res.json());
                alert("✅ New Payment Successful!");
            },
            onCancel: () => alert("Payment Cancelled."),
            onError: (e) => alert("Payment Error: " + e.message)
        });

    } catch (e) {
        console.error("Payment Init Error:", e);
        alert("Payment process failed: " + e.message);
    }
}


// --- AI and Chat Functions ---

// AI Analysis Function (Placeholder using fetch to your backend)
window.startAiAnalysis = async function() {
    const btn = document.getElementById('start-analysis-btn');
    if(btn) {
        btn.innerHTML = "Analyzing...";
        btn.disabled = true;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: "User wants to list a laptop", files: [] }) // Mock data
        });
        const result = await response.json();

        if (result.success) {
            alert("AI Analysis Complete! Product Listed: " + result.product.name);
        } else {
            alert("AI Analysis Failed: " + result.error);
        }

    } catch (error) {
        console.error("AI Analysis Fetch Error:", error);
        alert("AI Service connection failed.");
    } finally {
        if(btn) {
            btn.innerHTML = "Analyze & List";
            btn.disabled = false;
        }
    }
};

// Logy AI Chatbot interaction
window.sendMessage = async function() {
    const input = document.getElementById('logy-input');
    const chatContainer = document.getElementById('chat-messages'); // Assuming you have a container
    const message = input ? input.value : '';

    if (!message) return;

    // Display user message immediately
    if (chatContainer) {
        chatContainer.innerHTML += `<div>**You**: ${message}</div>`;
    }
    
    input.value = "";

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const result = await response.json();
        
        // Display AI response
        if (chatContainer && result.aiResponse) {
            chatContainer.innerHTML += `<div>**Logy AI**: ${result.aiResponse}</div>`;
        }
    } catch (error) {
        console.error("AI Chat Fetch Error:", error);
        if (chatContainer) chatContainer.innerHTML += `<div>**Logy AI**: Sorry, the service is currently unavailable.</div>`;
    }
};

// Attach AI functions to the window object if they are called directly via HTML onclick
window.startAiAnalysis = window.startAiAnalysis;
window.sendMessage = window.sendMessage;
