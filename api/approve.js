import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Error');

    const { paymentId } = req.body;
    // المفتاح ده هنجيبه من موقع Pi ونحطه في Vercel
    const PI_API_KEY = process.env.PI_API_KEY; 

    try {
        // إبلاغ Pi بالموافقة على العملية
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });
        
        // إغلاق العملية
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {txid: ''}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        }).catch(e => {}); // تجاهل الخطأ لو العملية اتقفلت لوحدها

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed" });
    }
}
