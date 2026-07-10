const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `payment_${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/add', authMiddleware, upload.single('screenshot'), (req, res) => {
  const { trx_id, amount } = req.body;
  const db = req.app.locals.db;
  if (!trx_id || !amount || amount < 100) {
    return res.status(400).json({ error: 'TRX ID and amount (min Rs 100) are required.' });
  }
  const screenshot = req.file ? `/uploads/${req.file.filename}` : null;
  db.prepare('INSERT INTO payments (user_id, trx_id, amount, screenshot) VALUES (?, ?, ?, ?)').run(req.user.id, trx_id, parseFloat(amount), screenshot);
  res.json({ message: 'Payment submitted. Waiting for admin approval.' });
});

module.exports = router;
