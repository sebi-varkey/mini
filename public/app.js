const API_URL = 'http://localhost:3000/api';

let studentScanner = null;
let shopScanner = null;

// Barcode Scanner for Student Portal
function startStudentScanner() {
  const scannerDiv = document.getElementById('student-scanner');
  scannerDiv.style.display = 'block';
  
  studentScanner = new Html5QrcodeScanner("student-reader", {
    fps: 10,
    qrbox: { width: 300, height: 150 },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.QR_CODE
    ]
  });
  
  studentScanner.render(onStudentScanSuccess, onScanError);
}

function onStudentScanSuccess(decodedText) {
  document.getElementById('student-uid').value = decodedText;
  stopStudentScanner();
  showMessage('Barcode scanned successfully!');
  checkBalance();
}

function stopStudentScanner() {
  if (studentScanner) {
    studentScanner.clear();
    studentScanner = null;
  }
  document.getElementById('student-scanner').style.display = 'none';
}

// Barcode Scanner for Shop Portal
function startShopScanner() {
  const scannerDiv = document.getElementById('shop-scanner');
  scannerDiv.style.display = 'block';
  
  shopScanner = new Html5QrcodeScanner("shop-reader", {
    fps: 10,
    qrbox: { width: 300, height: 150 },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.QR_CODE
    ]
  });
  
  shopScanner.render(onShopScanSuccess, onScanError);
}

function onShopScanSuccess(decodedText) {
  document.getElementById('scan-uid').value = decodedText;
  stopShopScanner();
  showMessage('Barcode scanned successfully!');
}

function stopShopScanner() {
  if (shopScanner) {
    shopScanner.clear();
    shopScanner = null;
  }
  document.getElementById('shop-scanner').style.display = 'none';
}

function onScanError(error) {
  // Ignore scan errors (they happen continuously while scanning)
}

function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function showMessage(text, type = 'success') {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
  msg.style.display = 'block';
  
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
}

async function checkBalance() {
  const uid = document.getElementById('student-uid').value;
  if (!uid) return showMessage('Please enter UID', 'error');
  
  try {
    const res = await fetch(`${API_URL}/student/${uid}`);
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error);
    
    document.getElementById('s-name').textContent = data.name;
    document.getElementById('s-balance').textContent = data.balance.toFixed(2);
    document.getElementById('s-limit').textContent = data.daily_limit.toFixed(2);
    document.getElementById('s-spent').textContent = data.daily_spent.toFixed(2);
    document.getElementById('s-status').textContent = data.is_frozen ? 'FROZEN' : 'ACTIVE';
    document.getElementById('s-status').className = data.is_frozen ? 'status-frozen' : 'status-active';
    
    document.getElementById('student-info').style.display = 'block';
    
    // Load transactions
    const txRes = await fetch(`${API_URL}/transactions/${uid}`);
    const transactions = await txRes.json();
    
    const txDiv = document.getElementById('transactions');
    if (transactions.length === 0) {
      txDiv.innerHTML = '<p>No transactions yet</p>';
    } else {
      txDiv.innerHTML = transactions.map(tx => `
        <div class="transaction-item">
          <strong>${tx.shop_name}</strong> - ₹${tx.amount} 
          <br><small>${new Date(tx.timestamp).toLocaleString()}</small>
        </div>
      `).join('');
    }
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function processPayment() {
  const uid = document.getElementById('scan-uid').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const shop_name = document.getElementById('shop-name').value;
  
  if (!uid || !amount || !shop_name) {
    return showMessage('Please fill all fields', 'error');
  }
  
  try {
    const res = await fetch(`${API_URL}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, amount, shop_name })
    });
    
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.error || data.message);
    
    const resultDiv = document.getElementById('payment-result');
    resultDiv.innerHTML = `
      <h3 style="color: #4caf50;">✓ Payment Successful</h3>
      <p><strong>Amount Paid:</strong> ₹${data.amount_paid}</p>
      <p><strong>New Balance:</strong> ₹${data.new_balance.toFixed(2)}</p>
    `;
    resultDiv.style.display = 'block';
    
    showMessage('Payment processed successfully!');
    
    // Clear form
    document.getElementById('scan-uid').value = '';
    document.getElementById('amount').value = '';
  } catch (err) {
    const resultDiv = document.getElementById('payment-result');
    resultDiv.innerHTML = `
      <h3 style="color: #f44336;">✗ Payment Failed</h3>
      <p>${err.message}</p>
    `;
    resultDiv.style.display = 'block';
    showMessage(err.message, 'error');
  }
}

async function addStudent() {
  const uid = document.getElementById('admin-uid').value;
  const name = document.getElementById('admin-name').value;
  const balance = parseFloat(document.getElementById('admin-balance').value) || 0;
  const daily_limit = parseFloat(document.getElementById('admin-limit').value) || 500;
  
  if (!uid || !name) {
    return showMessage('UID and Name are required', 'error');
  }
  
  try {
    const res = await fetch(`${API_URL}/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, name, balance, daily_limit })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    showMessage('Student added successfully!');
    document.getElementById('admin-uid').value = '';
    document.getElementById('admin-name').value = '';
    document.getElementById('admin-balance').value = '';
    document.getElementById('admin-limit').value = '';
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function rechargeAccount() {
  const uid = document.getElementById('recharge-uid').value;
  const amount = parseFloat(document.getElementById('recharge-amount').value);
  
  if (!uid || !amount) {
    return showMessage('Please fill all fields', 'error');
  }
  
  try {
    const res = await fetch(`${API_URL}/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, amount })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    showMessage(`Recharged! New balance: ₹${data.new_balance.toFixed(2)}`);
    document.getElementById('recharge-uid').value = '';
    document.getElementById('recharge-amount').value = '';
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function freezeAccount(freeze) {
  const uid = document.getElementById('freeze-uid').value;
  if (!uid) return showMessage('Please enter UID', 'error');
  
  try {
    const res = await fetch(`${API_URL}/freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, freeze })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    showMessage(`Account ${freeze ? 'frozen' : 'unfrozen'} successfully!`);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function updateLimit() {
  const uid = document.getElementById('limit-uid').value;
  const daily_limit = parseFloat(document.getElementById('new-limit').value);
  
  if (!uid || !daily_limit) {
    return showMessage('Please fill all fields', 'error');
  }
  
  try {
    const res = await fetch(`${API_URL}/daily-limit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, daily_limit })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    showMessage(`Daily limit updated to ₹${daily_limit}`);
    document.getElementById('limit-uid').value = '';
    document.getElementById('new-limit').value = '';
  } catch (err) {
    showMessage(err.message, 'error');
  }
}


// Barcode Generator Functions
function generateBarcode() {
  const uid = document.getElementById('barcode-uid').value;
  const name = document.getElementById('barcode-name').value;
  
  if (!uid) {
    showMessage('Please enter a UID', 'error');
    return;
  }
  
  // Clear previous QR code
  document.getElementById('qrcode').innerHTML = '';
  
  // Generate barcode
  JsBarcode("#barcode", uid, {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: true,
    fontSize: 16,
    margin: 10
  });
  
  // Generate QR code
  new QRCode(document.getElementById("qrcode"), {
    text: uid,
    width: 128,
    height: 128,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  // Update card details
  document.getElementById('display-name').textContent = name || 'Student';
  document.getElementById('display-uid').textContent = uid;
  
  // Show card
  document.getElementById('card-preview').style.display = 'block';
  showMessage('ID Card generated successfully!');
}

function printCard() {
  if (document.getElementById('card-preview').style.display === 'none') {
    showMessage('Please generate a card first', 'error');
    return;
  }
  window.print();
}
