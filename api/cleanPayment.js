// الملف: api/cleanPayment.js
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    // هذا يعتمد على وجود PI_API_KEY في متغيرات البيئة بـ Vercel
    const PI_API_KEY = process.env.PI_API_KEY; 
    const config = { headers: { Authorization: `Key ${PI_API_KEY}` } };

    try {
        console.log(`Cleaning payment: ${paymentId}`);

        // 1. محاولة الموافقة (لتأكيدها قبل الإكمال)
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, config)
            .catch(err => console.log("Approve skipped/failed."));

        // 2. محاولة الإكمال
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, { txid: '' }, config)
            .then(() => { return res.status(200).json({ status: "completed" }); })
            .catch(async (err) => {
                console.log("Complete failed, trying cancel...");
                
                // 3. لو الإكمال فشل، نلغيها
                await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {}, config);
                return res.status(200).json({ status: "cancelled" });
            });

    } catch (error) {
        // نرجع نجاحاً قسرياً لفك حظر المتصفح
        return res.status(200).json({ status: "forced_done" });
    }
}
