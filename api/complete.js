export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { paymentId, txid, user } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: "paymentId and txid required" });

    console.log("PAYMENT CONFIRMED:", paymentId, txid, user);

    res.status(200).json({ ok: true, message: "Payment recorded" });
}
