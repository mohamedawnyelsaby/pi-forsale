import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {
        return res.status(400).json({ error: "Missing paymentId or txid" });
    }

    console.log("📡 Completing Payment:", paymentId, "TX:", txid);

    try {
        const PI_API_KEY = process.env.PI_API_KEY;
        const URL = "https://api.minepi.com/v2";

        const response = await axios.post(
            `${URL}/payments/${paymentId}/complete`,
            { txid },
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Payment completed:", response.data);

        return res.status(200).json({
            success: true,
            paymentId,
            txid,
            data: response.data,
        });

    } catch (error) {
        console.error("❌ Payment completion failed:", error.response?.data || error.message);
        res.status(500).json({
            error: "Payment completion failed",
            details: error.response?.data || error.message,
        });
    }
}
