// هذا ملف Node.js Backend
// يحتاج تثبيت: npm install express axios body-parser cors

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// مفتاح API الخاص بك من Pi Developer Portal
const PI_API_KEY = "PUT_YOUR_PI_API_KEY_HERE"; 
const PI_PLATFORM_API_URL = "https://api.minepi.com/v2";

// 1. نقطة الموافقة على الدفع (/approve)
app.post('/payment/approve', async (req, res) => {
    const { paymentId, productId } = req.body;
    console.log(`Approving payment: ${paymentId} for product: ${productId}`);

    try {
        // نخبر سيرفرات Pi أننا موافقون على هذه العملية
        const response = await axios.post(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}/approve`, 
            {}, 
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error approving payment:", error.response?.data || error.message);
        res.status(500).json({ error: "Approval failed" });
    }
});

// 2. نقطة إكمال الدفع (/complete)
app.post('/payment/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    console.log(`Completing payment: ${paymentId}, TXID: ${txid}`);

    try {
        // نخبر سيرفرات Pi أننا تحققنا من TXID (يمكنك التحقق منه في البلوكتشين هنا)
        const response = await axios.post(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}/complete`, 
            { txid }, 
            { headers: { 'Authorization': `Key ${PI_API_KEY}` } }
        );
        
        // هنا يمكنك حفظ الطلب في قاعدة بياناتك (MongoDB مثلاً)
        // saveOrderToDatabase(paymentId, txid);

        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error completing payment:", error.response?.data || error.message);
        res.status(500).json({ error: "Completion failed" });
    }
});

// 3. التعامل مع الدفعات المعلقة
app.post('/payment/incomplete', async (req, res) => {
    const { payment } = req.body;
    // منطق للتحقق من حالة الدفع وإكماله أو إلغاؤه
    // هذا يعتمد على حالتها (transaction_verified أم لا)
    res.status(200).send("Processed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Forsale AI Backend running on port ${PORT}`);
});
