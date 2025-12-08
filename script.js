// ... (داخل دالة handlePiLogin أو حيث تستدعي Pi.authenticate)
const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
// ...

// الدالة المسؤولة عن معالجة الدفع العالق
function onIncompletePaymentFound(payment) {
    console.log("Incomplete Payment Found:", payment);
    
    // الحل: محاولة إنشاء الدفع مرة أخرى (Pi.createPayment) باستخدام كائن الدفع العالق
    return Pi.createPayment(payment, {
        onReadyForServerApproval: (paymentId) => { 
            // logic to call your server's /payments/approve endpoint
            axios.post(`${API_BASE_URL}/payments/approve`, { paymentId });
        },
        onReadyForServerCompletion: (paymentId, txid) => { 
            // logic to call your server's /payments/complete endpoint
            axios.post(`${API_BASE_URL}/payments/complete`, { paymentId, txid });
        },
        onCancel: (paymentId) => { console.log("Cancelled Incomplete Payment", paymentId); },
        onError: (error, payment) => { console.error("Error on Incomplete Payment", error); }
    });
}
