import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { payment } = req.body;

    if (!payment) {
        return res.status(400).json({ error: "Missing payment object" });
    }

    try {
        const PI_API_KEY = process.env.PI_API_KEY;
        const URL = "https://api.minepi.com/v2";

        const paymentId = payment.identifier;

        console.log("⚠️ Handling incomplete payment:", paymentId);

        const info = await axios.get(`${URL}/payments/${paymentId}`, {
            headers: {
                Authorization: `Key ${PI_API_KEY}`,
            },
        });

        const paymentData = info.data;

        // If payment is already broadcasted and txid exists → complete it
        if (paymentData.transaction && !paymentData.status.developer_completed) {
            await axios.post(
                `${URL}/payments/${paymentId}/complete`,
                { txid: paymentData.transaction.txid },
                {
                    headers: {
                        Authorization: `Key ${PI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("✅ Incomplete payment completed");
        }

        return res.status(200).json({
            success: true,
            message: "Handled incomplete payment",
        });

    } catch (error) {
        console.error("❌ Failed to process incomplete payment:", error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to process incomplete payment",
            details: error.response?.data || error.message,
        });
    }
}
