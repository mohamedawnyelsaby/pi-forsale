import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    try {
        console.log(`Force Cancelling payment: ${paymentId}`);
        
        // محاولة إلغاء العملية مباشرة لفتح الطريق
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });

        return res.status(200).json({ success: true, message: "Payment Cancelled Successfully" });

    } catch (error) {
        console.error("Cancel failed, trying to complete just in case:", error.message);
        
        // لو الإلغاء فشل (لأنها مكتملة مثلاً)، نحاول ننهيها
        try {
            await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, {
                headers: { Authorization: `Key ${PI_API_KEY}` }
            });
            return res.status(200).json({ success: true, message: "Payment Completed (Force Fix)" });
        } catch (err2) {
            return res.status(500).json({ error: "Could not fix payment" });
        }
    }
}
