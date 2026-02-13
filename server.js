const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./campus_payment.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    balance REAL DEFAULT 0,
    daily_limit REAL DEFAULT 500,
    is_frozen INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT NOT NULL,
    amount REAL NOT NULL,
    shop_name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uid) REFERENCES students(uid)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS last_scan (
    uid TEXT PRIMARY KEY,
    last_scan_time INTEGER NOT NULL
  )`);
});


// Helper: Check daily spending
function getDailySpending(uid, callback) {
  const today = new Date().toISOString().split('T')[0];
  db.get(
    `SELECT SUM(amount) as total FROM transactions 
     WHERE uid = ? AND DATE(timestamp) = ?`,
    [uid, today],
    (err, row) => {
      if (err) callback(err, null);
      else callback(null, row.total || 0);
    }
  );
}

// API: Add/Update student
app.post('/api/student', (req, res) => {
  const { uid, name, balance, daily_limit } = req.body;
  
  db.run(
    `INSERT INTO students (uid, name, balance, daily_limit) 
     VALUES (?, ?, ?, ?) 
     ON CONFLICT(uid) DO UPDATE SET 
     name = excluded.name, 
     balance = excluded.balance,
     daily_limit = excluded.daily_limit`,
    [uid, name, balance || 0, daily_limit || 500],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Student added/updated' });
    }
  );
});

// API: Get student info
app.get('/api/student/:uid', (req, res) => {
  const { uid } = req.params;
  
  db.get('SELECT * FROM students WHERE uid = ?', [uid], (err, student) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    getDailySpending(uid, (err, dailySpent) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...student, daily_spent: dailySpent });
    });
  });
});


// API: Process payment (with anti-scan, freeze check, daily limit)
app.post('/api/payment', (req, res) => {
  const { uid, amount, shop_name } = req.body;
  const currentTime = Date.now();

  // Check last scan time (anti-scan: 30-second cooldown)
  db.get('SELECT last_scan_time FROM last_scan WHERE uid = ?', [uid], (err, lastScan) => {
    if (err) return res.status(500).json({ error: err.message });

    if (lastScan && (currentTime - lastScan.last_scan_time) < 30000) {
      const waitTime = Math.ceil((30000 - (currentTime - lastScan.last_scan_time)) / 1000);
      return res.status(429).json({ 
        error: 'Anti-scan protection active', 
        message: `Please wait ${waitTime} seconds before next transaction` 
      });
    }

    // Get student details
    db.get('SELECT * FROM students WHERE uid = ?', [uid], (err, student) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!student) return res.status(404).json({ error: 'Student not found' });
      
      // Check if account is frozen
      if (student.is_frozen) {
        return res.status(403).json({ error: 'Account is frozen' });
      }

      // Check balance
      if (student.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Check daily limit
      getDailySpending(uid, (err, dailySpent) => {
        if (err) return res.status(500).json({ error: err.message });

        if (dailySpent + amount > student.daily_limit) {
          return res.status(400).json({ 
            error: 'Daily limit exceeded',
            daily_limit: student.daily_limit,
            spent_today: dailySpent
          });
        }

        // Process payment
        db.run('BEGIN TRANSACTION');
        
        db.run(
          'UPDATE students SET balance = balance - ? WHERE uid = ?',
          [amount, uid],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }

            db.run(
              'INSERT INTO transactions (uid, amount, shop_name) VALUES (?, ?, ?)',
              [uid, amount, shop_name],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }

                db.run(
                  `INSERT INTO last_scan (uid, last_scan_time) VALUES (?, ?)
                   ON CONFLICT(uid) DO UPDATE SET last_scan_time = excluded.last_scan_time`,
                  [uid, currentTime],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: err.message });
                    }

                    db.run('COMMIT');
                    res.json({ 
                      success: true, 
                      new_balance: student.balance - amount,
                      amount_paid: amount
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});


// API: Add tokens (recharge)
app.post('/api/recharge', (req, res) => {
  const { uid, amount } = req.body;
  
  db.run(
    'UPDATE students SET balance = balance + ? WHERE uid = ?',
    [amount, uid],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      
      db.get('SELECT balance FROM students WHERE uid = ?', [uid], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, new_balance: row.balance });
      });
    }
  );
});

// API: Freeze/Unfreeze account
app.post('/api/freeze', (req, res) => {
  const { uid, freeze } = req.body;
  
  db.run(
    'UPDATE students SET is_frozen = ? WHERE uid = ?',
    [freeze ? 1 : 0, uid],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      res.json({ success: true, is_frozen: freeze });
    }
  );
});

// API: Get transaction history
app.get('/api/transactions/:uid', (req, res) => {
  const { uid } = req.params;
  
  db.all(
    'SELECT * FROM transactions WHERE uid = ? ORDER BY timestamp DESC LIMIT 50',
    [uid],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// API: Update daily limit
app.post('/api/daily-limit', (req, res) => {
  const { uid, daily_limit } = req.body;
  
  db.run(
    'UPDATE students SET daily_limit = ? WHERE uid = ?',
    [daily_limit, uid],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Student not found' });
      res.json({ success: true, daily_limit });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
