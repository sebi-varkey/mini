import React, { useState } from 'react';
import { api } from '../api';
import BarcodeScanner from './BarcodeScanner';

function ShopPortal({ showMessage }) {
  const [shopName, setShopName] = useState('');
  const [uid, setUid] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const processPayment = async () => {
    if (!uid || !amount || !shopName) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await api.processPayment({
        uid,
        amount: parseFloat(amount),
        shop_name: shopName
      });

      setPaymentResult({
        success: true,
        ...response.data
      });
      showMessage('Payment processed successfully!');
      setUid('');
      setAmount('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Payment failed';
      setPaymentResult({
        success: false,
        error: errorMsg
      });
      showMessage(errorMsg, 'error');
    }
  };

  const handleScan = (decodedText) => {
    setUid(decodedText);
    setShowScanner(false);
    showMessage('Barcode scanned successfully!');
  };

  return (
    <div>
      <h2>Shop Portal</h2>
      <div className="card">
        <input
          type="text"
          placeholder="Shop Name (e.g., Canteen)"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Scan Student UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
        <button onClick={() => setShowScanner(!showScanner)}>
          📷 Scan Barcode/QR Code
        </button>

        {showScanner && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={processPayment}>Process Payment</button>
      </div>

      {paymentResult && (
        <div className="info-box">
          {paymentResult.success ? (
            <>
              <h3 style={{ color: '#48bb78' }}>✓ Payment Successful</h3>
              <p><strong>Amount Paid:</strong> ₹{paymentResult.amount_paid}</p>
              <p><strong>New Balance:</strong> ₹{paymentResult.new_balance.toFixed(2)}</p>
            </>
          ) : (
            <>
              <h3 style={{ color: '#f56565' }}>✗ Payment Failed</h3>
              <p>{paymentResult.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ShopPortal;
