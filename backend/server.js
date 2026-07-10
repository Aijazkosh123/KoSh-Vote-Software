const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const { initDatabase } = require('./database');
const db = initDatabase();

// Make db available
app.locals.db = db;

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const smmRoutes = require('./routes/smm');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/smm', smmRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const adminCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = ?").get('admin').cnt;
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  res.json({ status: 'ok', adminExists: adminCount > 0, totalUsers: userCount, serverTime: new Date().toISOString() });
});

// Serve built frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ KoSh Vote running on http://localhost:${PORT}`);
});
