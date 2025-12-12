import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { paymentId, productId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: "Missing paymentId" });
    }

    console.log("📡 Approving Payment:", paymentId);

    try {
        const PI_API_KEY = process.env.PI_API_KEY;
        const PI_PLATFORM_API_URL = "https://api.minepi.com/v2";

        // Approve payment
        const response = await axios.post(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Payment approved:", response.data);

        return res.status(200).json({
            success: true,
            paymentId,
            productId,
            data: response.data,
        });

    } catch (error) {
        console.error("❌ Payment approval failed:", error.response?.data || error.message);
        res.status(500).json({
            error: "Payment approval failed",
            details: error.response?.data || error.message,
        });
    }
}
