// ============================================
// 🤖 Forsale AI - Backend Server
// Simple & Working Version
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// 1. CORS Configuration
// ============================================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://pi-forsale.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ============================================
// 2. Middleware
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ============================================
// 3. Routes
// ============================================

// Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Forsale AI is running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: NODE_ENV
  });
});

// Products API
app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 'p1',
      name: 'iPhone 15 Pro',
      price: 105,
      description: 'آيفون 15 برو، حالة ممتازة',
      image: 'https://placehold.co/600x400/00f2ff/0a1128?text=iPhone+15+Pro',
      aiScore: 9.2
    },
    {
      id: 'p2',
      name: 'MacBook Pro M3',
      price: 155,
      description: 'لابتوب احترافي بشاشة 14 بوصة',
      image: 'https://placehold.co/600x400/FFD700/0a1128?text=MacBook+Pro',
      aiScore: 8.8
    }
  ];
  
  res.json({ success: true, products });
});

// Payment API (Mock for Testnet)
app.post('/api/payment/approve', (req, res) => {
  const { paymentId, amount } = req.body;
  
  console.log('💰 Payment approved:', paymentId, amount);
  
  res.json({
    success: true,
    message: 'Payment approved (Testnet)',
    paymentId,
    testnet: true
  });
});

// AI Chat API
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  
  console.log('🤖 AI Chat:', message);
  
  const responses = [
    "مرحباً! أنا Logy AI 🤖",
    "يمكنني مساعدتك في البحث عن المنتجات",
    "هذا تطبيق تجريبي يعمل على Testnet"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({ success: true, response: randomResponse });
});

// ============================================
// 4. Error Handling
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ============================================
// 5. Start Server
// ============================================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🤖 Forsale AI Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🚀 Node.js: ${process.version}`);
  console.log('═══════════════════════════════════════');
});

module.exports = app;
