import React, { useState } from 'react';
import { api } from '../api';
import BarcodeScanner from './BarcodeScanner';

function StudentPortal({ showMessage }) {
  const [uid, setUid] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  const checkBalance = async () => {
    if (!uid) {
      showMessage('Please enter UID', 'error');
      return;
    }

    try {
      const response = await api.getStudent(uid);
      setStudentInfo(response.data);

      const txResponse = await api.getTransactions(uid);
      setTransactions(txResponse.data);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Error fetching student info', 'error');
    }
  };

  const handleScan = (decodedText) => {
    setUid(decodedText);
    setShowScanner(false);
    showMessage('Barcode scanned successfully!');
    setTimeout(() => {
      checkBalance();
    }, 500);
  };

  return (
    <div>
      <h2>Student Portal</h2>
      <div className="card">
        <input
          type="text"
          placeholder="Enter your UID (barcode)"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
        <button onClick={() => setShowScanner(!showScanner)}>
          📷 Scan Barcode/QR Code
        </button>
        <button onClick={checkBalance}>Check Balance</button>

        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>

      {studentInfo && (
        <div className="info-box">
          <h3>Account Details</h3>
          <p><strong>Name:</strong> {studentInfo.name}</p>
          <p><strong>Balance:</strong> ₹{studentInfo.balance.toFixed(2)}</p>
          <p><strong>Daily Limit:</strong> ₹{studentInfo.daily_limit.toFixed(2)}</p>
          <p><strong>Spent Today:</strong> ₹{studentInfo.daily_spent.toFixed(2)}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={studentInfo.is_frozen ? 'status-frozen' : 'status-active'}>
              {studentInfo.is_frozen ? 'FROZEN' : 'ACTIVE'}
            </span>
          </p>

          <h3 style={{ marginTop: '25px' }}>Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p>No transactions yet</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <strong>{tx.shop_name}</strong> - ₹{tx.amount}
                <br />
                <small>{new Date(tx.timestamp).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default StudentPortal;
