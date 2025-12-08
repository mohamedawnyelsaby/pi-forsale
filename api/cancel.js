import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    try {
        console.log(`Cancelling payment: ${paymentId}`);
        // إرسال أمر الإلغاء لـ Pi
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });
        res.status(200).json({ success: true, message: "Cancelled" });
    } catch (error) {
        // حتى لو فشل الإلغاء، بنعتبره تم عشان نفتح الطريق
        console.log("Cancel error (ignored):", error.message);
        res.status(200).json({ success: true, message: "Force cleared" });
    }
}
