// ============================================
// 🤖 Forsale AI - Complete Backend Server (Provided)
// Node.js + Express + Pi Network API Integration
// Keep PI_API_KEY in environment — DO NOT COMMIT SECRET KEYS
// ============================================
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// serve static files from repo root (index.html, css, js)
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

const PI_API_KEY = process.env.PI_API_KEY;
const PI_PLATFORM_API_URL = "https://api.minepi.com/v2";
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PI_API_KEY) {
    console.warn('⚠️ PI_API_KEY not set in environment. Set it in Vercel/Env before using production endpoints.');
}

// In-memory store (for demo)
const database = { payments: new Map(), orders: new Map(), disputes: new Map() };

// simple health
app.get('/health', (req, res) => {
    res.json({ status: 'OK', piIntegration: !!PI_API_KEY, time: new Date().toISOString() });
});

// Payment endpoints (thin wrappers) - require PI_API_KEY to actually call Pi APIs
app.post('/payment/approve', async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });
    // Simulate approval (in production call Pi API)
    database.payments.set(paymentId, { status: 'approved', id: paymentId });
    return res.json({ success: true, paymentId });
});

app.post('/payment/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) return res.status(400).json({ error: 'Missing paymentId or txid' });
    const p = database.payments.get(paymentId) || {};
    p.status = 'completed'; p.txid = txid;
    database.payments.set(paymentId, p);
    // create simple order
    const orderId = `ORDER_${Date.now()}`;
    database.orders.set(orderId, { paymentId, status: 'processing' });
    return res.json({ success: true, orderId });
});

// fallback to index.html for any unmatched route (single page)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
