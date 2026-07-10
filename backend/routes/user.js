const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// GET /api/user/me - Get current user info
router.get('/me', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT id, name, email, role, balance, total_votes, custom_rate, blocked, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.blocked) return res.status(403).json({ error: 'Account blocked.' });

  // Get API key for this user
  const apiKeyRow = db.prepare('SELECT * FROM api_keys WHERE user_id = ?').get(user.id);

  // Track online
  db.prepare('INSERT OR REPLACE INTO online_users (user_id, last_seen) VALUES (?, ?)').run(user.id, new Date().toISOString());

  res.json({
    ...user,
    smm_api_key: apiKeyRow ? apiKeyRow.api_key : null,
    smm_api_url: apiKeyRow ? apiKeyRow.smm_api_url : null
  });
});

// PUT /api/user/api-key - Update user's SMM API key
router.put('/api-key', authMiddleware, (req, res) => {
  const { api_key, smm_api_url } = req.body;
  const db = req.app.locals.db;

  if (!api_key) return res.status(400).json({ error: 'API key is required.' });

  db.prepare(`
    INSERT INTO api_keys (user_id, api_key, smm_api_url) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET api_key = ?, smm_api_url = ?, updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, api_key, smm_api_url || 'https://cheappakpanel.com/api/v2', api_key, smm_api_url || 'https://cheappakpanel.com/api/v2');

  res.json({ message: 'API key updated successfully.' });
});

// GET /api/user/orders - Get user orders
router.get('/orders', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(orders);
});

// GET /api/user/balance - Get balance
router.get('/balance', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const user = db.prepare('SELECT balance, total_votes FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// GET /api/user/payments - Get payment history
router.get('/payments', authMiddleware, (req, res) => {
  const db = req.app.locals.db;
  const payments = db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(payments);
});

module.exports = router;
