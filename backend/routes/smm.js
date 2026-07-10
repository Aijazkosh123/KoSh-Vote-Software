const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

// POST /api/smm/order - Place a new order
router.post('/order', authMiddleware, async (req, res) => {
  const { service_key, link, quantity } = req.body;
  const db = req.app.locals.db;

  if (!service_key || !link || !quantity) {
    return res.status(400).json({ error: 'Service key, link, and quantity are required.' });
  }

  const minVoteSetting = db.prepare("SELECT value FROM settings WHERE key = 'min_vote'").get();
  const minVote = parseInt(minVoteSetting?.value || '10');

  if (quantity < minVote) {
    return res.status(400).json({ error: `Minimum quantity is ${minVote}.` });
  }

  const service = db.prepare('SELECT * FROM services WHERE service_key = ?').get(service_key);
  if (!service) {
    return res.status(400).json({ error: 'Invalid service.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user || user.blocked) {
    return res.status(403).json({ error: 'Account blocked or not found.' });
  }

  const rate = user.custom_rate || parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'rate'").get().value);
  
  let price;
  if (service_key === 'C1' || service_key === 'C2') {
    price = (quantity / 1000) * (service.price || rate);
  } else {
    price = quantity * rate;
  }

  if (user.balance < price) {
    return res.status(400).json({ error: `Insufficient balance. Need Rs ${price.toFixed(2)}, have Rs ${user.balance.toFixed(2)}.` });
  }

  // Deduct balance
  db.prepare('UPDATE users SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(price, user.id);

  const apiKeySetting = db.prepare("SELECT value FROM settings WHERE key = 'api_key'").get();
  const apiUrlSetting = db.prepare("SELECT value FROM settings WHERE key = 'api_url'").get();
  const API_KEY = apiKeySetting?.value || 'e4d8d1fc34eba7caa23d5eb5bace0022';
  const API_URL = apiUrlSetting?.value || 'https://cheappakpanel.com/api/v2';

  const botOrderId = 'BOT' + Date.now();

  try {
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'add');
    params.append('service', service.smm_service_id);
    params.append('link', link);
    params.append('quantity', String(quantity));

    const response = await axios.post(API_URL, params, { timeout: 15000 });

    if (response.data && response.data.order) {
      db.prepare(`
        INSERT INTO orders (user_id, bot_order_id, smm_order_id, service_name, service_id, service_type, link, quantity, price, rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, botOrderId, String(response.data.order), service.service_name, service.smm_service_id, service_key.startsWith('C') ? 'custom' : 'vote', link, quantity, price, rate);

      db.prepare('UPDATE users SET total_votes = total_votes + ? WHERE id = ?').run(quantity, user.id);

      const newBalance = user.balance - price;
      return res.json({
        message: 'Order placed successfully!',
        botOrderId,
        smmOrderId: String(response.data.order),
        service: service.service_name,
        quantity,
        price,
        newBalance
      });
    } else {
      db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(price, user.id);
      return res.status(400).json({ error: 'Order failed. Balance refunded.' });
    }
  } catch (err) {
    db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(price, user.id);
    return res.status(500).json({ error: 'Order error. Balance refunded.' });
  }
});

// GET /api/smm/services - Get available services
router.get('/services', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const services = db.prepare('SELECT * FROM services ORDER BY service_key').all();
  const rate = db.prepare("SELECT value FROM settings WHERE key = 'rate'").get();
  res.json({ services, defaultRate: parseFloat(rate?.value || '1.80') });
});

module.exports = router;
