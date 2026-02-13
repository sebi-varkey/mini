import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import './BarcodeGenerator.css';

function BarcodeGenerator({ showMessage }) {
  const [uid, setUid] = useState('STU001');
  const [name, setName] = useState('Test Student');
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (showCard) {
      generateCodes();
    }
  }, [showCard, uid]);

  const generateCodes = () => {
    if (!uid) {
      showMessage('Please enter a UID', 'error');
      return;
    }

    try {
      // Generate barcode
      JsBarcode('#barcode', uid, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        margin: 10
      });

      // Generate QR code
      const canvas = document.getElementById('qrcode');
      QRCode.toCanvas(canvas, uid, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      showMessage('ID Card generated successfully!');
    } catch (error) {
      showMessage('Error generating codes', 'error');
    }
  };

  const handleGenerate = () => {
    setShowCard(true);
  };

  const handlePrint = () => {
    if (!showCard) {
      showMessage('Please generate a card first', 'error');
      return;
    }
    window.print();
  };

  return (
    <div>
      <h2>Generate Student Barcode</h2>

      <div className="card">
        <h3>🎫 Create ID Card</h3>
        <input
          type="text"
          placeholder="Enter Student UID (e.g., STU001)"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleGenerate}>Generate ID Card</button>
        <button
          onClick={handlePrint}
          style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}
        >
          🖨️ Print ID Card
        </button>
      </div>

      {showCard && (
        <div id="card-preview">
          <div className="student-card">
            <h2>🏫 College ID Card</h2>
            <h3>{name}</h3>
            <p><strong>UID:</strong> {uid}</p>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="barcode-area" style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ color: '#333', fontWeight: 'bold', marginBottom: '10px' }}>Barcode</p>
                <svg id="barcode"></svg>
              </div>
              <div className="barcode-area" style={{ flex: 1, minWidth: '150px' }}>
                <p style={{ color: '#333', fontWeight: 'bold', marginBottom: '10px' }}>QR Code</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <canvas id="qrcode"></canvas>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', marginTop: '10px', color: '#fff' }}>
              Scan barcode or QR code for payments
            </p>
          </div>

          <div className="info-box" style={{ marginTop: '20px' }}>
            <h3>Instructions</h3>
            <p>✓ Print this card or scan directly from screen</p>
            <p>✓ Use the barcode in Student/Shop portals</p>
            <p>✓ Click "Scan Barcode" button to use camera</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarcodeGenerator;
