const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PI_API_KEY = process.env.PI_API_KEY;
const PI_API_URL = 'https://api.minepi.com';

let products = [
    {
        id: 'p1',
        name: 'iPhone 15 Pro',
        price: 105000,
        category: 'tech',
        description: 'جهاز ممتاز',
        seller_id: 'seller1'
    }
];
let orders = [];
let payments = [];

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        pi_api_configured: !!PI_API_KEY
    });
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/orders', (req, res) => {
    const order = {
        id: 'ORDER' + Date.now(),
        ...req.body,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    orders.push(order);
    res.status(201).json(order);
});

app.post('/api/payments/approve', async (req, res) => {
    try {
        const { paymentId } = req.body;
        
        if (!PI_API_KEY) {
            console.log('⚠️ PI_API_KEY not set, simulating approval');
            return res.json({ success: true, message: 'Simulated approval' });
        }
        
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/approve`,
            {},
            { headers: { 'Authorization': `Key ${PI_API_KEY}` }}
        );
        
        payments.push({ paymentId, status: 'approved', timestamp: new Date() });
        console.log('✅ Payment approved:', paymentId);
        
        res.json({ success: true, payment: response.data });
    } catch (error) {
        console.error('Payment approval error:', error.message);
        res.status(500).json({ error: 'Payment approval failed' });
    }
});

app.post('/api/payments/complete', async (req, res) => {
    try {
        const { paymentId, txid } = req.body;
        
        if (!PI_API_KEY) {
            console.log('⚠️ PI_API_KEY not set, simulating completion');
            return res.json({ success: true, message: 'Simulated completion', txid });
        }
        
        const response = await axios.post(
            `${PI_API_URL}/v2/payments/${paymentId}/complete`,
            { txid },
            { headers: { 'Authorization': `Key ${PI_API_KEY}` }}
        );
        
        const payment = payments.find(p => p.paymentId === paymentId);
        if (payment) {
            payment.status = 'completed';
            payment.txid = txid;
        }
        
        console.log('✅ Payment completed:', paymentId, 'TX:', txid);
        
        res.json({ success: true, payment: response.data });
    } catch (error) {
        console.error('Payment completion error:', error.message);
        res.status(500).json({ error: 'Payment completion failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Forsale AI Backend running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔑 Pi API Key: ${PI_API_KEY ? '✅ Configured' : '❌ Not set'}`);
});
```

✅ **حفظ الملف باسم: `server.js`**

---

## ✅ **ملف #3: `Procfile`**

انسخ السطر ده وحطه في ملف جديد اسمه `Procfile` **(بدون امتداد، مش .txt)**:
```
web: node server.js
```

✅ **حفظ الملف باسم: `Procfile` (بدون أي امتداد)**

---

## ✅ **ملف #4: `.gitignore`**

انسخ الأسطر دي وحطها في ملف جديد اسمه `.gitignore`:
```
node_modules/
.env
uploads/
*.log
.DS_Store
