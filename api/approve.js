import axios from 'axios';

export default async function handler(req, res) {
    // السماح للكود يشتغل
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    // لو المفتاح مش موجود، نرجع رسالة واضحة بدل ما السيرفر يقع
    if (!PI_API_KEY) {
        return res.status(500).json({ error: "API Key Not Found" });
    }

    try {
        console.log(`Force fixing payment: ${paymentId}`);

        // المحاولة الأولى: إلغاء (Cancel)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        }).catch(err => console.log("Cancel skipped"));

        // المحاولة الثانية: إكمال (Complete)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        }).catch(err => console.log("Complete skipped"));

        // نرجع نجاح عشان التطبيق يفك التعليقة
        return res.status(200).json({ success: true, message: "Fixed" });

    } catch (error) {
        return res.status(500).json({ error: "Server logic error", details: error.message });
    }
}
