import fetch from "node-fetch";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: "paymentId required" });

    try {
        const resp = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${process.env.PI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });

        const data = await resp.json();
        res.status(200).json({ ok: true, data });

    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
}
