// في ملف script.js

function onIncompletePaymentFound(payment) {
    console.log("Incomplete Payment Found:", payment);
    
    // الحل: محاولة إنشاء الدفع مرة أخرى باستخدام كائن الدفع العالق
    return Pi.createPayment(payment, {
        onReadyForServerApproval: (paymentId) => { 
            // 🚨 استخدام fetch بدلاً من axios
            fetch(`${API_BASE_URL}/payments/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            }).then(res => res.json()).then(data => console.log("Incomplete Approved:", data));
        },
        onReadyForServerCompletion: (paymentId, txid) => { 
            // 🚨 استخدام fetch بدلاً من axios
            fetch(`${API_BASE_URL}/payments/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            }).then(res => res.json()).then(data => console.log("Incomplete Completed:", data));
        },
        onCancel: (paymentId) => { console.log("Cancelled Incomplete Payment", paymentId); },
        onError: (error, payment) => { console.error("Error on Incomplete Payment", error); }
    });
}
