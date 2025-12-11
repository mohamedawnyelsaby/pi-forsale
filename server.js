// ============================================
// 🤖 Forsale AI - Backend Server v2.0
// Node.js 24.x Compatible
// ============================================

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ============================================
// 1. CONFIGURATION
// ============================================

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://pi-forsale.vercel.app',
  'https://pi-forsale-git-main-mohamedawnyelsabys-projects.vercel.app',
  'https://pi-forsale-*.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => 
      origin === allowed || 
      allowed.includes('*') && origin.includes(allowed.replace('*', ''))
    )) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// ============================================
// 2. STATIC FILES
// ============================================

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(join(__dirname, 'script.js'));
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
    version: '2.0.0',
    nodeVersion: process.version,
    platform: process.platform,
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
      description: 'Testnet product - for demonstration only',
      image: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
      aiScore: 9.2
    },
    {
      id: 'p2',
      name: 'MacBook Pro M3 - 16GB',
      price: 155,
      description: 'Testnet product - for demonstration only',
      image: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook+Pro',
      aiScore: 8.8
    },
    {
      id: 'p3',
      name: 'Apple Watch Series 9',
      price: 85,
      description: 'Testnet product - for demonstration only',
      image: 'https://placehold.co/600x400/2ECC71/0a1128?text=Apple+Watch',
      aiScore: 9.5
    }
  ]
};

// Pi Payment Approval (Mock for Testnet)
app.post('/api/payment/approve', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Payment approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pi Payment Completion (Mock for Testnet)
app.post('/api/payment/complete', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Payment completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Get Orders
app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  
  // In a real app, you would filter by userId
  const userOrders = Object.values(demoData.orders).filter(order => 
    order.paymentId && demoData.payments[order.paymentId]
  );
  
  res.json({
    success: true,
    orders: userOrders,
    testnet: true
  });
});

// ============================================
// 5. AI ENDPOINTS (Mock)
// ============================================

app.post('/api/ai/chat', (req, res) => {
  try {
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
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// 6. ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    testnet: true
  });
});

// ============================================
// 7. START SERVER
// ============================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════');
  console.log('🤖 Forsale AI Backend Server v2.0');
  console.log('═══════════════════════════════════════');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔧 Node.js: ${process.version}`);
  console.log(`🚀 Pi Network: Testnet Ready`);
  console.log(`📡 CORS: ${allowedOrigins.length} origins allowed`);
  console.log('═══════════════════════════════════════');
  
  if (NODE_ENV === 'development') {
    console.log('🔓 Test Mode: Using mock payments');
    console.log('💡 Tip: Use Pi Browser for full Pi Network integration');
    console.log(`📊 Products: ${demoData.products.length} demo products loaded`);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
