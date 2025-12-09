// ============================================
// 🔥 Forsale AI - Complete Backend Server
// Node.js + Express + Pi Network API Integration
// ============================================

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ============================================
// 1. Middleware Configuration
// ============================================
app.use(cors()); // السماح بـ CORS
app.use(bodyParser.json()); // قراءة JSON من الطلبات
app.use(express.static('public')); // ملفات ثابتة (HTML, CSS, JS)

// ============================================
// 2. Pi Network Configuration
// ============================================
const PI_API_KEY = process.env.PI_API_KEY || "YOUR_PI_API_KEY_HERE"; // ⚠️ ضع مفتاحك هنا!
const PI_PLATFORM_API_URL = "https://api.minepi.com/v2";

// التحقق من وجود المفتاح
if (PI_API_KEY === "YOUR_PI_API_KEY_HERE") {
    console.warn('⚠️ WARNING: PI_API_KEY not set! Get it from: https://develop.pi');
}

// ============================================
// 3. Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Forsale AI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// 4. Payment Approval Endpoint (STEP 10 - CRITICAL!)
// ============================================
app.post('/payment/approve', async (req, res) => {
    const { paymentId, productId } = req.body;
    
    console.log(`📡 Approving Payment: ${paymentId} for Product: ${productId}`);
    
    // التحقق من البيانات
    if (!paymentId) {
        return res.status(400).json({ 
            error: 'Missing paymentId' 
        });
    }
    
    try {
        // إرسال الموافقة لـ Pi Network
        const response = await axios.post(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}/approve`,
            {}, // لا يوجد body في طلب الموافقة
            {
                headers: {
                    'Authorization': `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Payment Approved:', response.data);
        
        // يمكنك حفظ البيانات في قاعدة بيانات هنا
        // await savePaymentToDatabase(paymentId, productId, 'approved');
        
        res.status(200).json({
            success: true,
            message: 'Payment approved successfully',
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ Payment Approval Failed:', error.response?.data || error.message);
        
        res.status(500).json({
            error: 'Payment approval failed',
            details: error.response?.data || error.message
        });
    }
});

// ============================================
// 5. Payment Completion Endpoint (STEP 10 - CRITICAL!)
// ============================================
app.post('/payment/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    
    console.log(`📡 Completing Payment: ${paymentId}, TXID: ${txid}`);
    
    // التحقق من البيانات
    if (!paymentId || !txid) {
        return res.status(400).json({ 
            error: 'Missing paymentId or txid' 
        });
    }
    
    try {
        // 🔍 (اختياري) التحقق من TXID على البلوكتشين
        // const isValidTx = await verifyTransactionOnBlockchain(txid);
        // if (!isValidTx) {
        //     return res.status(400).json({ error: 'Invalid transaction' });
        // }
        
        // إرسال إكمال الدفع لـ Pi Network
        const response = await axios.post(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}/complete`,
            { txid }, // إرسال TXID
            {
                headers: {
                    'Authorization': `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Payment Completed:', response.data);
        
        // حفظ الطلب في قاعدة البيانات
        // await saveOrderToDatabase(paymentId, txid);
        
        // 🤖 تشغيل الذكاء الاصطناعي لإدارة الشحن
        // await triggerAIShippingLogistics(paymentId);
        
        res.status(200).json({
            success: true,
            message: 'Payment completed successfully',
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ Payment Completion Failed:', error.response?.data || error.message);
        
        res.status(500).json({
            error: 'Payment completion failed',
            details: error.response?.data || error.message
        });
    }
});

// ============================================
// 6. Incomplete Payment Handler
// ============================================
app.post('/payment/incomplete', async (req, res) => {
    const { payment } = req.body;
    
    console.log('⚠️ Processing Incomplete Payment:', payment);
    
    try {
        // التحقق من حالة الدفع
        const paymentId = payment.identifier;
        
        const response = await axios.get(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Key ${PI_API_KEY}`
                }
            }
        );
        
        const paymentData = response.data;
        console.log('Payment Status:', paymentData);
        
        // إذا كانت المعاملة مكتملة على البلوكتشين ولكن لم تُغلق
        if (paymentData.transaction && !paymentData.status.developer_completed) {
            // إكمالها
            await axios.post(
                `${PI_PLATFORM_API_URL}/payments/${paymentId}/complete`,
                { txid: paymentData.transaction.txid },
                {
                    headers: {
                        'Authorization': `Key ${PI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('✅ Incomplete payment completed');
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Incomplete payment processed' 
        });
        
    } catch (error) {
        console.error('❌ Error processing incomplete payment:', error.response?.data || error.message);
        
        res.status(500).json({
            error: 'Failed to process incomplete payment',
            details: error.response?.data || error.message
        });
    }
});

// ============================================
// 7. Get Payment Status (Optional - for debugging)
// ============================================
app.get('/payment/:paymentId', async (req, res) => {
    const { paymentId } = req.params;
    
    try {
        const response = await axios.get(
            `${PI_PLATFORM_API_URL}/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Key ${PI_API_KEY}`
                }
            }
        );
        
        res.status(200).json(response.data);
        
    } catch (error) {
        console.error('❌ Error fetching payment:', error.response?.data || error.message);
        
        res.status(500).json({
            error: 'Failed to fetch payment',
            details: error.response?.data || error.message
        });
    }
});

// ============================================
// 8. AI Shipping Logistics (Future Feature)
// ============================================
async function triggerAIShippingLogistics(paymentId) {
    console.log('🤖 AI Shipping triggered for payment:', paymentId);
    
    // هنا يمكنك إضافة منطق الذكاء الاصطناعي:
    // - إنشاء بوليصة شحن تلقائياً
    // - اختيار أفضل شركة شحن (DHL, FedEx, etc.)
    // - إرسال إشعارات للبائع والمشتري
    // - تتبع الشحنة في الوقت الفعلي
    
    // مثال بسيط:
    // await sendNotificationToSeller(paymentId);
    // await generateShippingLabel(paymentId);
}

// ============================================
// 9. Database Functions (Placeholder)
// ============================================
async function savePaymentToDatabase(paymentId, productId, status) {
    // يمكنك استخدام MongoDB, PostgreSQL, etc.
    console.log('💾 Saving payment to database:', { paymentId, productId, status });
    
    // مثال MongoDB:
    // const db = getDatabase();
    // await db.collection('payments').insertOne({
    //     paymentId,
    //     productId,
    //     status,
    //     createdAt: new Date()
    // });
}

async function saveOrderToDatabase(paymentId, txid) {
    console.log('💾 Saving order to database:', { paymentId, txid });
    
    // مثال MongoDB:
    // const db = getDatabase();
    // await db.collection('orders').insertOne({
    //     paymentId,
    //     txid,
    //     status: 'pending_shipment',
    //     createdAt: new Date()
    // });
}

// ============================================
// 10. Error Handler Middleware
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ============================================
// 11. Start Server
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🚀 Forsale AI Backend Server Started');
    console.log('═══════════════════════════════════════');
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🔐 Pi API Key: ${PI_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('═══════════════════════════════════════');
    
    if (PI_API_KEY === "YOUR_PI_API_KEY_HERE") {
        console.warn('⚠️  WARNING: Set your Pi API Key!');
        console.warn('Get it from: https://develop.pi');
    }
});
