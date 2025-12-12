// ============================================
// 🤖 Forsale AI - Complete Fixed Backend Server
// ============================================
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// CORS Configuration - CRITICAL FIX
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

const PI_API_KEY = process.env.PI_API_KEY;
const PI_PLATFORM_API_URL = "https://api.minepi.com/v2";
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PI_API_KEY) {
    console.warn('⚠️ PI_API_KEY not set. Payment endpoints will use demo mode.');
}

// In-memory database (for demo)
const database = {
    payments: new Map(),
    orders: new Map(),
    users: new Map()
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        piIntegration: !!PI_API_KEY,
        time: new Date().toISOString(),
        endpoints: {
            approve: '/payment/approve',
            complete: '/payment/complete'
        }
    });
});

// ============================================
// PAYMENT APPROVAL ENDPOINT - FIXED
// ============================================
app.post('/payment/approve', async (req, res) => {
    console.log('\n🔔 PAYMENT APPROVAL REQUEST');
    console.log('Body:', req.body);
    
    try {
        const { paymentId, userId, amount, title } = req.body;
        
        if (!paymentId) {
            console.error('❌ Missing paymentId');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing paymentId' 
            });
        }

        console.log(`💳 Approving payment: ${paymentId}`);

        // Store payment info
        database.payments.set(paymentId, {
            id: paymentId,
            status: 'approved',
            userId: userId || 'unknown',
            amount: amount || 0,
            title: title || 'Unknown product',
            timestamp: Date.now()
        });

        // If PI_API_KEY is available, call real Pi API
        if (PI_API_KEY) {
            try {
                console.log('📤 Calling Pi Platform API...');
                
                const response = await axios.post(
                    `${PI_PLATFORM_API_URL}/payments/${paymentId}/approve`,
                    {},
                    {
                        headers: {
                            'Authorization': `Key ${PI_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('✅ Pi API Response:', response.data);
                
                return res.json({
                    success: true,
                    paymentId,
                    piResponse: response.data,
                    message: 'Payment approved successfully'
                });

            } catch (apiError) {
                console.error('❌ Pi API Error:', apiError.response?.data || apiError.message);
                
                // Continue anyway in demo mode
                return res.json({
                    success: true,
                    paymentId,
                    message: 'Payment approved (demo mode)',
                    warning: 'Pi API call failed, using demo mode'
                });
            }
        } else {
            // Demo mode - no real Pi API call
            console.log('⚠️ Demo mode - no Pi API key');
            
            return res.json({
                success: true,
                paymentId,
                message: 'Payment approved (demo mode)'
            });
        }

    } catch (error) {
        console.error('💥 Approval error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PAYMENT COMPLETION ENDPOINT - FIXED
// ============================================
app.post('/payment/complete', async (req, res) => {
    console.log('\n🎉 PAYMENT COMPLETION REQUEST');
    console.log('Body:', req.body);
    
    try {
        const { paymentId, txid, userId } = req.body;
        
        if (!paymentId || !txid) {
            console.error('❌ Missing paymentId or txid');
            return res.status(400).json({ 
                success: false, 
                error: 'Missing paymentId or txid' 
            });
        }

        console.log(`✅ Completing payment: ${paymentId}`);
        console.log(`📝 Transaction ID: ${txid}`);

        // Get payment info
        const payment = database.payments.get(paymentId) || {};
        payment.status = 'completed';
        payment.txid = txid;
        payment.completedAt = Date.now();
        database.payments.set(paymentId, payment);

        // Create order
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const order = {
            orderId,
            paymentId,
            txid,
            userId: userId || payment.userId || 'unknown',
            amount: payment.amount || 0,
            title: payment.title || 'Unknown product',
            status: 'processing',
            createdAt: Date.now()
        };
        
        database.orders.set(orderId, order);
        
        console.log('📦 Order created:', order);

        // If PI_API_KEY is available, call real Pi API
        if (PI_API_KEY) {
            try {
                console.log('📤 Calling Pi Platform API for completion...');
                
                const response = await axios.post(
                    `${PI_PLATFORM_API_URL}/payments/${paymentId}/complete`,
                    { txid },
                    {
                        headers: {
                            'Authorization': `Key ${PI_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('✅ Pi API Completion Response:', response.data);
                
                return res.json({
                    success: true,
                    orderId,
                    paymentId,
                    txid,
                    piResponse: response.data,
                    message: 'Payment completed successfully',
                    order
                });

            } catch (apiError) {
                console.error('❌ Pi API Completion Error:', apiError.response?.data || apiError.message);
                
                // Continue anyway in demo mode
                return res.json({
                    success: true,
                    orderId,
                    paymentId,
                    txid,
                    message: 'Payment completed (demo mode)',
                    warning: 'Pi API call failed, using demo mode',
                    order
                });
            }
        } else {
            // Demo mode
            console.log('⚠️ Demo mode - no Pi API key');
            
            return res.json({
                success: true,
                orderId,
                paymentId,
                txid,
                message: 'Payment completed (demo mode)',
                order
            });
        }

    } catch (error) {
        console.error('💥 Completion error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DEBUG ENDPOINTS
// ============================================
app.get('/debug/payments', (req, res) => {
    res.json({
        payments: Array.from(database.payments.values()),
        orders: Array.from(database.orders.values()),
        count: {
            payments: database.payments.size,
            orders: database.orders.size
        }
    });
});

app.get('/debug/payment/:paymentId', (req, res) => {
    const payment = database.payments.get(req.params.paymentId);
    if (payment) {
        res.json({ found: true, payment });
    } else {
        res.status(404).json({ found: false, paymentId: req.params.paymentId });
    }
});

// ============================================
// SERVE FRONTEND
// ============================================
app.get('*', (req, res) => {
    if (req.path.includes('.')) {
        // File request
        res.sendFile(path.join(__dirname, req.path));
    } else {
        // SPA route
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((error, req, res, next) => {
    console.error('💥 Server error:', error);
    res.status(500).json({
        success: false,
        error: error.message
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 Forsale AI Server Started');
    console.log('=================================');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔑 Pi API Key: ${PI_API_KEY ? '✅ Set' : '❌ Not set (demo mode)'}`);
    console.log(`📍 Endpoints:`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /payment/approve`);
    console.log(`   - POST /payment/complete`);
    console.log(`   - GET  /debug/payments`);
    console.log('=================================\n');
});
