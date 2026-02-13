# Campus Digital Token Payment System

A modern React + Python Flask application for campus-based digital payments with barcode scanning, anti-fraud features, and account management.

## 🚀 Features

✅ **Digital Token System** - Convert real money to campus tokens
✅ **Barcode & QR Code Scanning** - Use existing student ID cards
✅ **Anti-Scan Protection** - 30-second cooldown between transactions
✅ **Smart Freeze** - Freeze/unfreeze accounts instantly
✅ **Daily Spending Limit** - Configurable per student
✅ **Transaction History** - Track all payments
✅ **Modern React UI** - Professional, responsive design
✅ **Python Flask Backend** - RESTful API with SQLite database

## 📁 Project Structure

```
campus-token-payment/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── campus_payment.db   # SQLite database (auto-created)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js          # Main app component
│   │   ├── api.js          # API client
│   │   └── index.js        # Entry point
│   └── package.json        # Node dependencies
└── README.md
```

## 🛠️ Installation & Setup

### Backend (Python Flask)

1. Navigate to backend folder:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

Server will run on: `http://localhost:5000`

### Frontend (React)

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

App will open at: `http://localhost:3000`

## 📱 Usage

### Admin Panel
1. Add students with UID (barcode number), name, initial balance
2. Recharge student accounts
3. Freeze/unfreeze accounts
4. Set daily spending limits

### Generate Barcode Tab
1. Enter student UID and name
2. Generate ID card with barcode and QR code
3. Print or scan directly from screen

### Shop Portal
1. Enter shop name (Canteen, Store, etc.)
2. Scan student barcode/QR code or enter UID manually
3. Enter amount
4. Process payment

### Student Portal
1. Enter your UID or scan barcode
2. Check balance, daily limit, and spending
3. View transaction history

## 🔒 Security Features

- **Anti-Scan Protection**: 30-second cooldown prevents double-charging
- **Account Freeze**: Instant account suspension capability
- **Daily Limits**: Prevent overspending with configurable limits
- **Transaction Logging**: Complete audit trail of all payments

## 🎯 API Endpoints

### Student Operations
- `POST /api/student` - Add/update student
- `GET /api/student/:uid` - Get student info

### Payment Operations
- `POST /api/payment` - Process payment

### Account Operations
- `POST /api/recharge` - Add tokens to account
- `POST /api/freeze` - Freeze/unfreeze account
- `POST /api/daily-limit` - Update daily spending limit

### Transaction History
- `GET /api/transactions/:uid` - Get transaction history

## 🧪 Testing

### Demo Data
Add a test student via Admin Panel:
- UID: `STU001`
- Name: `Test Student`
- Balance: `1000`
- Daily Limit: `500`

### Test Scenarios
1. **Normal Payment**: Process a payment successfully
2. **Anti-Scan**: Try paying twice within 30 seconds
3. **Frozen Account**: Freeze account and attempt payment
4. **Daily Limit**: Exceed daily spending limit
5. **Insufficient Balance**: Try payment with low balance

## 🎨 Tech Stack

### Frontend
- React 18
- Axios (API calls)
- html5-qrcode (Barcode scanning)
- jsbarcode (Barcode generation)
- qrcode (QR code generation)

### Backend
- Python 3.x
- Flask (Web framework)
- Flask-CORS (Cross-origin support)
- SQLite (Database)

## 📝 Notes

- The backend uses SQLite for easy setup (no complex database configuration)
- QR codes scan more reliably than barcodes with phone cameras
- USB barcode scanners work directly in input fields (no special setup needed)
- The app is fully responsive and works on mobile devices

## 🎓 For Presentation

1. Start both backend and frontend servers
2. Demo the complete workflow:
   - Add student in Admin Panel
   - Generate ID card with barcode
   - Process payment in Shop Portal
   - Show anti-scan protection
   - Demonstrate account freeze
   - Display transaction history

## 📄 License

This project is for educational purposes.

---

Good luck with your college presentation! 🎉
