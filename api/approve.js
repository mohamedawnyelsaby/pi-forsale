import axios from 'axios';

export default async function handler(req, res) {
    // 1. السماح بالاتصال
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
        return res.status(500).json({ error: "API Key is missing in Vercel" });
    }

    try {
        // 2. الموافقة على الدفع (Approve)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });

        // 3. إكمال الدفع (Complete)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });

        return res.status(200).json({ success: true, message: "Payment Completed" });

    } catch (error) {
        console.error("Payment Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment Failed", details: error.response?.data });
    }
}
