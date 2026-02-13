# Quick Start Guide

## Step 1: Start Backend (Python Flask)

Open a terminal and run:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
🚀 Server running on http://localhost:5000
```

## Step 2: Start Frontend (React)

Open a NEW terminal and run:

```bash
cd frontend
npm install
npm start
```

Browser will automatically open at `http://localhost:3000`

## Step 3: Test the Application

1. Go to **Admin Panel** tab
2. Add a test student:
   - UID: `STU001`
   - Name: `Test Student`
   - Balance: `1000`
   - Daily Limit: `500`
3. Click "Add Student"

4. Go to **Generate Barcode** tab
5. Generate ID card for `STU001`

6. Go to **Shop Portal** tab
7. Enter shop name: `Canteen`
8. Scan the QR code or enter UID: `STU001`
9. Enter amount: `50`
10. Click "Process Payment"

## Troubleshooting

### Backend Issues
- Make sure Python 3.x is installed
- Check if port 5000 is available
- Install dependencies: `pip install Flask Flask-CORS`

### Frontend Issues
- Make sure Node.js is installed
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and run `npm install` again

### Camera/Scanner Issues
- Allow camera permissions in browser
- Use QR codes instead of barcodes (easier to scan)
- Ensure good lighting
- Try a different browser (Chrome works best)

## That's it! 🎉

Your Campus Token Payment System is ready to use!
