const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

function initDatabase() {
  const dbDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(path.join(dbDir, 'koshvote.db'));

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      balance REAL DEFAULT 0,
      total_votes INTEGER DEFAULT 0,
      custom_rate REAL DEFAULT NULL,
      blocked INTEGER DEFAULT 0,
      api_key TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bot_order_id TEXT UNIQUE NOT NULL,
      smm_order_id TEXT,
      service_name TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_type TEXT DEFAULT 'vote',
      link TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      rate REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trx_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      screenshot TEXT DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(T
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT UNIQUE NOT NULL,
      service_name TEXT NOT NULL,
      smm_service_id TEXT NOT NULL,
      price REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      api_key TEXT NOT NULL,
      smm_api_url TEXT DEFAULT 'https://cheappakpanel.com/api/v2',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(T
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(T
    CREATE TABLE IF NOT EXISTS online_users (
      user_id INTEGER PRIMARY KEY,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  var count = db.prepare('SELECT COUNT(*) as cnt FROM services').get();
  if (count.cnt === 0) {
    var insertService = db.prepare('INSERT OR IGNORE INTO services (service_key, service_name, smm_service_id, price) VALUES (?, ?, ?, ?)');
    insertService.run('A', 'WhatsApp Vote - Answer 1', '14420', 1.80);
    insertService.run('B', 'WhatsApp Vote - Answer 2', '14421', 1.80);
    insertService.run('C', 'WhatsApp Vote - Answer 3', '14422', 1.80);
    insertService.run('D', 'WhatsApp Vote - Answer 4', '14423', 1.80);
    insertService.run('E', 'WhatsApp Vote - Answer 5', '14424', 1.80);
    insertService.run('C1', 'Custom Service 1', '0', 0.50);
    insertService.run('C2', 'Custom Service 2', '0', 0.60);
  }

  var rateCount = db.prepare("SELECT COUNT(*) as cnt FROM settings WHERE key = 'rate'").get();
  if (rateCount.cnt === 0) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('rate', '1.80')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('min_vote', '10')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('easypaisa', '03XX-XXXXXXX')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('jazzcash', '03077321978')").run();
  }

  var adminCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'").get();
  if (adminCount.cnt === 0) {
    var hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
      .run('Admin', process.env.ADMIN_EMAIL || 'admin@koshvote.com', hashedPassword, 'admin');
  }

  console.log('Ⅰ db init');
  return db;
}

module.exports = { initDatabase };
