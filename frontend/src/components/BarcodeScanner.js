import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function BarcodeScanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'barcode-reader',
      {
        fps: 10,
        qrbox: { width: 300, height: 150 },
        formatsToSupport: [0, 1, 2, 3, 11] // CODE_128, CODE_39, EAN_13, EAN_8, QR_CODE
      }
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // Ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div style={{ marginTop: '15px' }}>
      <div className="scan-tip">
        <strong>💡 Scanning Tips:</strong> Hold barcode/QR code steady in front of camera. 
        Ensure good lighting. QR codes scan easier than barcodes.
      </div>
      <div id="barcode-reader" style={{ width: '100%' }}></div>
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
          marginTop: '10px'
        }}
      >
        Stop Scanner
      </button>
    </div>
  );
}

export default BarcodeScanner;
