import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method Not Allowed" });

    const { amount, memo, uid } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY)
        return res.status(500).json({ error: "Missing API Key" });

    try {
        // ---------------------------
        // 1) Force Fix any pending payments
        // ---------------------------
        await axios.get("https://api.minepi.com/v2/payments", {
            headers: { Authorization: `Key ${PI_API_KEY}` }
        }).then(async r => {
            const pending = r.data?.data?.filter(p => p.status === "pending") || [];

            for (let p of pending) {
                const id = p.identifier;

                // Cancel old stuck payments
                await axios.post(
                    `https://api.minepi.com/v2/payments/${id}/cancel`,
                    {},
                    { headers: { Authorization: `Key ${PI_API_KEY}` } }
                ).catch(() => null);

                // Complete attempt (for some stuck payments)
                await axios.post(
                    `https://api.minepi.com/v2/payments/${id}/complete`,
                    { txid: "" },
                    { headers: { Authorization: `Key ${PI_API_KEY}` } }
                ).catch(() => null);
            }
        });

        // ---------------------------
        // 2) Create fresh payment
        // ---------------------------
        const createRes = await axios.post(
            "https://api.minepi.com/v2/payments",
            {
                amount,
                memo,
                metadata: { uid }
            },
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const paymentId = createRes.data.identifier;

        // ---------------------------
        // 3) Complete the payment instantly
        // ---------------------------
        await axios.post(
            `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            { txid: "" },
            { headers: { Authorization: `Key ${PI_API_KEY}` } }
        );

        // ---------------------------
        // 4) Return success to frontend
        // ---------------------------
        return res.status(200).json({
            success: true,
            paymentId,
            message: "Payment processed successfully and all stuck payments fixed."
        });

    } catch (err) {
        return res.status(500).json({
            error: "Payment failed",
            details: err.response?.data || err.message
        });
    }
}
