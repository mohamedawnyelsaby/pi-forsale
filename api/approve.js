import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

    const { paymentId } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    try {
        // الموافقة
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        });
        
        // الإكمال
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {txid: ''}, {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        }).catch(e => console.log("Complete handled by client"));

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to approve" });
    }
}
