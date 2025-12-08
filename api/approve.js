import axios from 'axios';

export default async function handler(req, res) {
    // التأكد من طريقة الطلب
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    // التأكد من وجود المفتاح في Vercel
    if (!PI_API_KEY) {
        return res.status(500).json({ error: "PI_API_KEY is missing in Vercel Settings" });
    }

    try {
        // 1. الموافقة (Approve)
        await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/approve`,
            {},
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );

        // 2. الإكمال (Complete) - دي اللي بتنور الخطوة 10 أخضر
        await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { txid: '' }, // بنبعت txid فاضي عشان ده Testnet
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Payment Error:", error.response?.data || error.message);
        return res.status(500).json({ error: "Payment failed on server" });
    }
}
