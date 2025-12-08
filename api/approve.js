const axios = require('axios');

module.exports = async (req, res) => {
    // التأكد من طريقة الطلب
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) return res.status(500).json({ error: "Missing API Key" });

    const config = { headers: { Authorization: `Key ${PI_API_KEY}` } };

    try {
        console.log(`Processing stuck payment: ${paymentId}`);

        // 1. محاولة الموافقة (Approve)
        // بنعمل catch عشان لو هي متوافق عليها قبل كده ما يوقفش الكود
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, config)
            .catch(err => console.log("Approve skipped (maybe already approved)"));

        // 2. محاولة الإكمال (Complete)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, config);

        return res.status(200).json({ success: true, message: "Payment Cleared" });

    } catch (error) {
        console.error("Error clearing payment:", error.response?.data || error.message);
        
        // لو فشل الإكمال، نحاول نكنسلها خالص عشان نفتح الطريق
        try {
             await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {}, config);
             return res.status(200).json({ success: true, message: "Payment Cancelled" });
        } catch (cancelError) {
             return res.status(500).json({ error: "Could not fix payment", details: cancelError.response?.data });
        }
    }
};
