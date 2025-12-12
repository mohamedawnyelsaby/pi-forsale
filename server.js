// server.js
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;

// simple health check
app.get('/health', (req, res) => {
  return res.json({ status: 'OK', piIntegration: !!process.env.PI_API_KEY });
});

/**
 * Create payment (Frontend calls this to create a payment)
 * - Validate product, create DB order as PENDING
 * - Call Pi create-payment API (server side) -> return paymentId + paymentUrl
 */
app.post('/api/payment/create', async (req, res) => {
  const { productId, buyerId } = req.body;
  // TODO: validate product in DB, price, inventory
  // create order in DB with status=PENDING
  // call Pi create-payment endpoint using PI_API_KEY
  try {
    // placeholder payload - adapt to Pi API format
    const payload = {
      app_id: process.env.PI_APP_ID,
      product_id: productId,
      amount: 100, // Pi amount
      currency: 'PI',
      callback_url: `${process.env.PI_CALLBACK_BASE}/complete`
    };
    // call Pi server (replace URL by Pi's API)
    const piResp = await axios.post('https://api.minepi.com/v1/payments/create', payload, {
      headers: { 'Authorization': `Bearer ${process.env.PI_API_KEY}` }
    });
    // store piResp.data.payment_id in DB etc.
    return res.json({ ok: true, payment: piResp.data });
  } catch (err) {
    console.error('create payment err', err?.response?.data || err.message);
    return res.status(500).json({ ok: false, error: 'Failed to create payment' });
  }
});

/**
 * Pi callback / webhook when payment is updated (approve/complete)
 * Pi will call this endpoint.
 * IMPORTANT: verify signature according to Pi docs (HMAC or other).
 */
app.post('/api/pi/complete', async (req, res) => {
  // Example: check HMAC signature header (customize per Pi docs)
  const signature = req.headers['x-pi-signature'] || req.headers['x-signature'];
  const body = JSON.stringify(req.body);
  const secret = process.env.PI_APP_SECRET || '';
  // Basic HMAC verify (adapt to Pi specification)
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (signature && expected !== signature) {
    console.warn('Invalid signature for Pi webhook');
    return res.status(401).send('Invalid signature');
  }

  const { paymentId, status, txid } = req.body;
  // TODO: update DB order status based on paymentId
  // If completed -> set order.paid = true; release escrow accordingly
  console.log('Pi webhook received', paymentId, status);
  return res.json({ ok: true });
});

/**
 * Approve endpoint — developer/admin triggers approve if needed
 */
app.post('/api/payment/approve', async (req, res) => {
  const { paymentId, productId } = req.body;
  // TODO: verify order, check inventory, then call Pi approve API if required
  return res.json({ ok: true, paymentId, productId });
});

app.listen(PORT, () => console.log(`Forsale API listening on ${PORT}`));
