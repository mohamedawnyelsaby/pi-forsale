// ===============================================
// server.js - Global Backend Code (English)
// ===============================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration & Local Database Setup (MOCK DB)
app.use(cors());
app.use(express.json());

const PI_API_KEY = process.env.PI_API_KEY || 'MOCK_PI_KEY';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'MOCK_GEMINI_KEY';
const PI_API_URL = 'https://api.minepi.com'; 

const DB_PATH = path.join(__dirname, 'db.json');

/** Reads data from the local JSON file. (Not for Production on Vercel) */
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.warn("DB file not found or invalid. Initializing mock data.");
        return { products: [], orders: [] };
    }
}

/** Writes data to the local JSON file. (Not for Production on Vercel) */
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// 🚨 WEBHOOK LISTENER: Pi Network will call this endpoint
app.post('/api/payments/webhook', (req, res) => {
    const data = req.body;
    console.log(`📡 Webhook Received: Status ${data.status} for Payment ${data.identifier}`);

    const db = readDB();
    const order = db.orders.find(o => o.paymentId === data.identifier);
    
    // IMPORTANT: Verify the request signature in a real application.
    
    if (order) {
        if (data.status === 'approved') {
            order.status = 'awaiting_shipping'; 
        } else if (data.status === 'completed') {
            order.status = 'delivered_funds_released';
        }
        writeDB(db);
    }

    res.status(200).json({ status: 'received', message: 'Webhook processed' });
});


// Server approves the payment after user authorizes it via Pi Wallet
app.post('/api/payments/approve', async (req, res) => {
    const { paymentId, orderId } = req.body;
    const db = readDB();
    const order = db.orders.find(o => o.id === orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    try {
        if (PI_API_KEY === 'MOCK_PI_KEY') {
            order.paymentId = paymentId;
            order.status = 'approved_mock';
            writeDB(db);
            return res.json({ success: true, message: 'Simulated approval in MOCK mode' });
        }
        
        // Call Pi API to approve payment (moves funds to escrow)
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/approve`,
            {},
            { headers: { 'Authorization': `Key ${PI_API_KEY}` }}
        );
        
        order.paymentId = paymentId;
        order.status = 'approved_by_server';
        writeDB(db);
        res.json({ success: true, payment: response.data });
        
    } catch (error) {
        console.error('Pi Payment approval error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Pi Payment approval failed' });
    }
});

// AI completes the payment and releases funds to the seller
app.post('/api/payments/complete', async (req, res) => {
    const { paymentId, txid } = req.body;
    
    try {
        if (PI_API_KEY === 'MOCK_PI_KEY') {
            return res.json({ success: true, message: 'Simulated completion' });
        }
        
        // Call Pi API to complete payment (releases funds from escrow)
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/complete`,
            { txid },
            { headers: { 'Authorization': `Key ${PI_API_KEY}` }}
        );
        
        res.json({ success: true, payment: response.data });
        
    } catch (error) {
        console.error('Pi Payment completion error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Pi Payment completion failed' });
    }
});

// AI analyzes product data and lists it automatically
app.post('/api/ai/analyze', async (req, res) => {
    const { description, files } = req.body;
    
    if (GEMINI_API_KEY === 'MOCK_GEMINI_KEY') {
        const db = readDB();
        const newProduct = {
            id: 'p' + Date.now(),
            name: `Logy AI Verified Product (${files.length} images)`,
            price: 99000 + Math.floor(Math.random() * 5000), 
            cat: 'tech',
            details: `Automatically listed by Logy AI based on: ${description}.`,
            seller_id: 'AI_BOT_LISTER',
            img: "https://placehold.co/600x400/FFD700/0a1128?text=AI+VERIFIED",
            ai_analysis: { score: 9.8, market_price: 100000, summary: 'High Confidence Listing. Ready to sell.', price_state_color: '#2ECC71' }
        };
        db.products.push(newProduct);
        writeDB(db);
        
        return res.json({ success: true, product: newProduct, message: 'AI Analysis & Listing success (Mock)' });
    }
    
    // PRODUCTION: Call Gemini Vision/Analysis API here
    try {
        res.status(501).json({ error: 'AI Analysis not fully integrated with external API yet.' });
    } catch (error) {
        res.status(500).json({ error: 'AI service failed' });
    }
});

// Logy AI Chatbot interaction
app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    
    if (GEMINI_API_KEY === 'MOCK_GEMINI_KEY') {
        const t_lower = message.toLowerCase();
        let aiResponse = 'I am Logy AI, the core of Forsale. I manage all aspects without human intervention. How can I assist you?';
        
        if (t_lower.includes('search')) { aiResponse = 'I can search for the best offers based on your detailed specifications.'; }
        else if (t_lower.includes('order status')) { aiResponse = 'To analyze your order status, please provide the Order ID.'; }
        
        return res.json({ aiResponse });
    }
    
    // PRODUCTION: Call Gemini Chat/Conversational API here
    try {
        res.status(501).json({ error: 'AI Chat not fully integrated with external API yet.' });
    } catch (error) {
        res.status(500).json({ error: 'AI chat service failed' });
    }
});

// Product & Order Endpoints
app.get('/api/products', (req, res) => {
    const db = readDB();
    res.json(db.products);
});

app.post('/api/orders', (req, res) => {
    const db = readDB();
    const order = {
        id: 'ORDER' + Date.now(),
        status: 'pending_payment',
        paymentId: null,
        ...req.body,
        created_at: new Date().toISOString()
    };
    db.orders.push(order);
    writeDB(db);
    res.status(201).json(order);
});

app.listen(PORT, () => {
    console.log(`🚀 Forsale AI Backend running on port ${PORT}`);
    console.log(`📡 API is reachable at: https://pi-forsale.vercel.app/api`);
    console.log(`🔑 Pi Key Status: ${PI_API_KEY !== 'MOCK_PI_KEY' ? '✅ Configured' : '❌ MOCK mode'}`);
});
