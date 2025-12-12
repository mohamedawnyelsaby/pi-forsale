export default async function handler(req, res) {
  try {
    const { paymentId, txid } = req.body;
    console.log("Complete:", paymentId, txid);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "complete failed" });
  }
}