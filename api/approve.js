export default async function handler(req, res) {
  try {
    const { paymentId } = req.body;
    console.log("Approve:", paymentId);
    return res.status(200).json({ success: true, paymentId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "approve failed" });
  }
}
