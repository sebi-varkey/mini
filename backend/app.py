from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime, date
import time

app = Flask(__name__)
CORS(app)

DATABASE = 'campus_payment.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS students (
        uid TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        daily_limit REAL DEFAULT 500,
        is_frozen INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL,
        amount REAL NOT NULL,
        shop_name TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uid) REFERENCES students(uid)
    )''')
    
    cursor.execute('''CREATE TABLE IF NOT EXISTS last_scan (
        uid TEXT PRIMARY KEY,
        last_scan_time INTEGER NOT NULL
    )''')
    
    conn.commit()
    conn.close()

def get_daily_spending(uid):
    conn = get_db()
    cursor = conn.cursor()
    today = date.today().isoformat()
    
    cursor.execute('''SELECT SUM(amount) as total FROM transactions 
                     WHERE uid = ? AND DATE(timestamp) = ?''', (uid, today))
    result = cursor.fetchone()
    conn.close()
    
    return result['total'] if result['total'] else 0

@app.route('/api/student', methods=['POST'])
def add_student():
    data = request.json
    uid = data.get('uid')
    name = data.get('name')
    balance = data.get('balance', 0)
    daily_limit = data.get('daily_limit', 500)
    
    if not uid or not name:
        return jsonify({'error': 'UID and name are required'}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO students (uid, name, balance, daily_limit) 
                         VALUES (?, ?, ?, ?) 
                         ON CONFLICT(uid) DO UPDATE SET 
                         name = excluded.name, 
                         balance = excluded.balance,
                         daily_limit = excluded.daily_limit''',
                      (uid, name, balance, daily_limit))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Student added/updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/<uid>', methods=['GET'])
def get_student(uid):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM students WHERE uid = ?', (uid,))
        student = cursor.fetchone()
        conn.close()
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        daily_spent = get_daily_spending(uid)
        
        return jsonify({
            'uid': student['uid'],
            'name': student['name'],
            'balance': student['balance'],
            'daily_limit': student['daily_limit'],
            'is_frozen': student['is_frozen'],
            'daily_spent': daily_spent
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payment', methods=['POST'])
def process_payment():
    data = request.json
    uid = data.get('uid')
    amount = data.get('amount')
    shop_name = data.get('shop_name')
    
    if not uid or not amount or not shop_name:
        return jsonify({'error': 'Missing required fields'}), 400
    
    current_time = int(time.time() * 1000)
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check anti-scan (30-second cooldown)
        cursor.execute('SELECT last_scan_time FROM last_scan WHERE uid = ?', (uid,))
        last_scan = cursor.fetchone()
        
        if last_scan:
            time_diff = current_time - last_scan['last_scan_time']
            if time_diff < 30000:
                wait_time = (30000 - time_diff) // 1000
                conn.close()
                return jsonify({
                    'error': 'Anti-scan protection active',
                    'message': f'Please wait {wait_time} seconds before next transaction'
                }), 429
        
        # Get student details
        cursor.execute('SELECT * FROM students WHERE uid = ?', (uid,))
        student = cursor.fetchone()
        
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        if student['is_frozen']:
            conn.close()
            return jsonify({'error': 'Account is frozen'}), 403
        
        if student['balance'] < amount:
            conn.close()
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Check daily limit
        daily_spent = get_daily_spending(uid)
        if daily_spent + amount > student['daily_limit']:
            conn.close()
            return jsonify({
                'error': 'Daily limit exceeded',
                'daily_limit': student['daily_limit'],
                'spent_today': daily_spent
            }), 400
        
        # Process payment
        cursor.execute('UPDATE students SET balance = balance - ? WHERE uid = ?', 
                      (amount, uid))
        cursor.execute('INSERT INTO transactions (uid, amount, shop_name) VALUES (?, ?, ?)',
                      (uid, amount, shop_name))
        cursor.execute('''INSERT INTO last_scan (uid, last_scan_time) VALUES (?, ?)
                         ON CONFLICT(uid) DO UPDATE SET last_scan_time = excluded.last_scan_time''',
                      (uid, current_time))
        
        conn.commit()
        new_balance = student['balance'] - amount
        conn.close()
        
        return jsonify({
            'success': True,
            'new_balance': new_balance,
            'amount_paid': amount
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recharge', methods=['POST'])
def recharge():
    data = request.json
    uid = data.get('uid')
    amount = data.get('amount')
    
    if not uid or not amount:
        return jsonify({'error': 'UID and amount are required'}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE students SET balance = balance + ? WHERE uid = ?', 
                      (amount, uid))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        cursor.execute('SELECT balance FROM students WHERE uid = ?', (uid,))
        result = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'new_balance': result['balance']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/freeze', methods=['POST'])
def freeze_account():
    data = request.json
    uid = data.get('uid')
    freeze = data.get('freeze')
    
    if not uid or freeze is None:
        return jsonify({'error': 'UID and freeze status are required'}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE students SET is_frozen = ? WHERE uid = ?', 
                      (1 if freeze else 0, uid))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'is_frozen': freeze})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/daily-limit', methods=['POST'])
def update_daily_limit():
    data = request.json
    uid = data.get('uid')
    daily_limit = data.get('daily_limit')
    
    if not uid or daily_limit is None:
        return jsonify({'error': 'UID and daily_limit are required'}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE students SET daily_limit = ? WHERE uid = ?', 
                      (daily_limit, uid))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'daily_limit': daily_limit})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<uid>', methods=['GET'])
def get_transactions(uid):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''SELECT * FROM transactions WHERE uid = ? 
                         ORDER BY timestamp DESC LIMIT 50''', (uid,))
        transactions = cursor.fetchall()
        conn.close()
        
        return jsonify([dict(tx) for tx in transactions])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    init_db()
    print('🚀 Server running on http://localhost:5000')
    app.run(debug=True, port=5000)
