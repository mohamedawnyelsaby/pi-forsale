// ============================================
// 🤖 Forsale AI - Backend Server
// Pi Network Testnet Ready
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ============================================
// 1. CONFIGURATION
// ============================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://pi-forsale.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true
}));

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// 2. STATIC FILES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// ============================================
// 3. HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Forsale AI Backend is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        version: '1.0.0',
        testnet: true
    });
});

// ============================================
// 4. PI NETWORK TESTNET ENDPOINTS
// ============================================

// In-memory storage for demo
const demoData = {
    payments: {},
    orders: {},
    products: [
        {
            id: 'p1',
            name: 'iPhone 15 Pro - 256GB',
            price: 105,
            description: 'Testnet product - for demonstration only'
        },
        {
            id: 'p2',
            name: 'MacBook Pro M3 - 16GB',
            price: 155,
            description: 'Testnet product - for demonstration only'
        }
    ]
};

// Pi Payment Approval (Mock for Testnet)
app.post('/api/payment/approve', (req, res) => {
    const { paymentId, amount, productId } = req.body;
    
    console.log(`📡 Approving payment: ${paymentId} for ${amount} Pi`);
    
    // Mock approval for Testnet
    demoData.payments[paymentId] = {
        id: paymentId,
        amount,
        productId,
        status: 'approved',
        timestamp: Date.now(),
        testnet: true
    };
    
    res.json({
        success: true,
        message: 'Payment approved (Testnet)',
        paymentId,
        testnet: true,
        mock: true
    });
});

// Pi Payment Completion (Mock for Testnet)
app.post('/api/payment/complete', (req, res) => {
    const { paymentId, txid } = req.body;
    
    console.log(`📡 Completing payment: ${paymentId}, TX: ${txid}`);
    
    // Update payment status
    if (demoData.payments[paymentId]) {
        demoData.payments[paymentId].status = 'completed';
        demoData.payments[paymentId].txid = txid;
        demoData.payments[paymentId].completedAt = Date.now();
        
        // Create order
        const orderId = `ORDER_${Date.now()}`;
        demoData.orders[orderId] = {
            id: orderId,
            paymentId,
            status: 'processing',
            shipping: {
                carrier: 'Logy AI Express (Testnet)',
                trackingId: `TEST_${Date.now()}`,
                estimatedDays: '3-5'
            },
            createdAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: 'Payment completed (Testnet)',
            orderId,
            testnet: true,
            mock: true
        });
    } else {
        res.status(404).json({
            error: 'Payment not found',
            testnet: true
        });
    }
});

// Get Products
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        products: demoData.products,
        testnet: true
    });
});

// ============================================
// 5. AI ENDPOINTS (Mock)
// ============================================

app.post('/api/ai/chat', (req, res) => {
    const { message } = req.body;
    
    console.log(`🤖 AI Chat: ${message.substring(0, 50)}...`);
    
    const responses = [
        "أنا Logy AI! 🤖 أتمكن من مساعدتك في شراء وبيع المنتجات على Pi Network.",
        "هذا تطبيق تجريبي يعمل على Testnet. جميع المعاملات للتجربة فقط.",
        "يمكنك تجربة عملية شراء كاملة باستخدام Pi Testnet.",
        "أنظمة الضمان (Escrow) تعمل تلقائياً لحماية المشتري والبائع.",
        "شكراً لتجربتك Forsale AI! 🚀"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
        success: true,
        response: randomResponse,
        testnet: true
    });
});

// ============================================
// 6. ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    
    res.status(500).json({
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
        testnet: true
    });
});

// ============================================
// 7. START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('🤖 Forsale AI Backend Server Started');
    console.log('═══════════════════════════════════════');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔧 Mode: ${NODE_ENV === 'production' ? 'Production' : 'Development'}`);
    console.log(`🚀 Pi Network: Testnet Ready`);
    console.log(`📡 CORS: ${allowedOrigins.length} origins allowed`);
    console.log('═══════════════════════════════════════');
    
    if (NODE_ENV === 'development') {
        console.log('🔓 Test Mode: Using mock payments');
        console.log('💡 Tip: Use Pi Browser for full Pi Network integration');
    }
});

module.exports = app;
