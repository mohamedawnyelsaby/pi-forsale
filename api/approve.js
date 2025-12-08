const axios = require('axios');

module.exports = async (req, res) => {
    // 1. التأكد من الطريقة
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
        return res.status(500).json({ error: "Missing API Key" });
    }

    try {
        // 2. الموافقة فوراً (Approve)
        console.log(`Approving payment: ${paymentId}`);
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });

        // 3. الإكمال فوراً (Complete)
        console.log(`Completing payment: ${paymentId}`);
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });

        res.status(200).json({ success: true });

    } catch (error) {
        // لو الدفعة أصلاً مقبولة من قبل، نعتبرها نجاح عشان ما نعلقش المستخدم
        if (error.response && error.response.status === 400) {
             return res.status(200).json({ success: true, note: "Already processed" });
        }
        console.error(error);
        res.status(500).json({ error: "Payment failed at server" });
    }
};
