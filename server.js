// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Pi = require('pi-node-sdk');
require('dotenv').config(); // لتحميل PI_APP_SECRET من ملف .env

// 1. **التحقق الأمني والمفتاح السري**
const PI_APP_SECRET = process.env.PI_APP_SECRET;
if (!PI_APP_SECRET) {
    console.error("FATAL ERROR: PI_APP_SECRET is not defined. Please check your .env file in the server directory.");
    process.exit(1);
}

const piClient = new Pi.Client({
    appSecret: PI_APP_SECRET // استخدام المفتاح السري بأمان
});

const app = express();

// إعداد الخادم
app.use(bodyParser.json());
// لكي يتمكن الخادم من تقديم ملفات الواجهة الأمامية (HTML/JS)
app.use(express.static('client')); 

// ==========================================================
// 2. مسار الموافقة على الدفع (Server Approval)
// ==========================================================
app.post('/api/payments/approve', async (req, res) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ success: false, error: 'Payment ID is required.' });
    }

    try {
        // الاتصال بـ Pi API لـ "منح الإذن" باستخدام المفتاح السري
        const approvalResponse = await piClient.post(`payments/${paymentId}/approve`, {});
        
        // **هنا يجب تخزين حالة الدفع مؤقتاً في قاعدة بيانات**

        res.json({ success: true, message: 'Payment approved successfully.', data: approvalResponse });

    } catch (error) {
        console.error(`Error approving payment ${paymentId}:`, error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: 'Failed to approve payment with Pi API.' });
    }
});

// ==========================================================
// 3. مسار إكمال الدفع (Server Completion)
// ==========================================================
app.post('/api/payments/complete', async (req, res) => {
    const { paymentId, txid } = req.body;

    if (!paymentId || !txid) {
        return res.status(400).json({ success: false, error: 'Payment ID and TxID are required.' });
    }

    try {
        // الاتصال بـ Pi API لـ "إكمال المعاملة"
        const completionResponse = await piClient.post(`payments/${paymentId}/complete`, { txid });

        // **الخطوة الحاسمة:** تحديث حالة الطلب في قاعدة البيانات إلى "مكتمل"
        // منح المستخدم المنتج/الخدمة التي دفع مقابلها.

        res.json({ success: true, message: 'Payment completed successfully, product delivered.', data: completionResponse });
    } catch (error) {
        console.error(`Error completing payment ${paymentId}:`, error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: 'Failed to complete payment with Pi API.' });
    }
});

// ==========================================================
// 4. بدء الخادم
// ==========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Secure Pi Backend running on http://localhost:${PORT}`);
});
