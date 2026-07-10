const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/add-balance', authMiddleware, adminMiddleware, (req, res) => {
  var db = req.app.locals.db;
  var user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.body.userId);
  if (!user) return res.status(404).json({ error: 'Null' });
  var newBalance = user.balance + parseFloat(req.body.amount);
  db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, req.body.userId);
  res.json({ message: `Rs ${parseFloat(req.body.amount)} added. Newbal: Rs ${newBalance.toFixed(2)}`, newBalance });
});

router.post('/remove-balance', authMiddleware, adminMiddleware, (req, res) => {
  var db = req.app.locals.db;
  var user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.body.userId);
  if (!user) return res.status(404).json({ error: 'Null' });
  var newBalance = Math.max(0, user.balance - parseFloat(req.body.amount));
  db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, req.body.userId);
  res.json({ message: `Rs ${parseFloat(req.body.amount)} removed. Newblance: Rs ${newBalance.toFixed(2)}` });
});

router.post('/block', authMiddleware, adminMiddleware, (req, res) => {
  req.app.locals.db.prepare('UPDATE users SET blocked = 1 WHERE id = ?').run(req.body.userId);
  res.json({ message: 'Plocked' });
});

router.post('/unblock', authMiddleware, adminMiddleware, (req, res) => {
  req.app.locals.db.prepare('UPDATE users SET blocked = 0 WHERE id = ?').run(req.body.userId);
  res.json({ message: 'Unlocked' });
});

router.post('/remove-user', authMiddleware, adminMiddleware, (req, res) => {
  if (req.body.userId == req.user.id) return res.status(400).json({ error: 'Self remove forbidden' });
  var db = req.app.locals.db;
  db.prepare('DELETE FROM orders WHERE user_id = ?').run(req.body.userId);
  db.prepare('DELETE FROM payments WHERE user_id = ?').run(req.body.userId);
  db.prepare('DELETE FROM api_keys WHERE user_id = ?').run(req.body.userId);
  db.prepare('DELETE FROM online_users WHERE user_id = ?').run(req.body.userId);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.body.userId);
  res.json({ message: 'Removed' });
});

router.post('/add-user', authMiddleware, adminMiddleware, (req, res) => {
  var { name, email, password } = req.body;
  var db = req.app.locals.db;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ error: 'Invalid' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return res.status(400).json({ error: 'Email exists' });
  var bcrypt = require('bcryptjs');
  db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, bcrypt.hashSync(password, 10));
  res.json({ message: 'User created' });
});

router.post('/reset-user-password', authMiddleware, adminMiddleware, (req, res) => {
  var { userId, newPassword } = req.body;
  if (!userId || !newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Invalid' });
  var db = req.app.locals.db;
  var user = db.prepare('SELECT name,email FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  var bcrypt = require('bcryptjs');
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), userId);
  res.json({ message: `Password reset for ${user.name} (${user.email})` });
});

module.exports = router;
