import React, { useState } from 'react';
import './App.css';
import StudentPortal from './components/StudentPortal';
import ShopPortal from './components/ShopPortal';
import AdminPanel from './components/AdminPanel';
import BarcodeGenerator from './components/BarcodeGenerator';
import Message from './components/Message';

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="container">
      <h1>🎓 Campus Token Payment</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          Student Portal
        </button>
        <button 
          className={`tab ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Shop Portal
        </button>
        <button 
          className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Panel
        </button>
        <button 
          className={`tab ${activeTab === 'barcode' ? 'active' : ''}`}
          onClick={() => setActiveTab('barcode')}
        >
          Generate Barcode
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'student' && <StudentPortal showMessage={showMessage} />}
        {activeTab === 'shop' && <ShopPortal showMessage={showMessage} />}
        {activeTab === 'admin' && <AdminPanel showMessage={showMessage} />}
        {activeTab === 'barcode' && <BarcodeGenerator showMessage={showMessage} />}
      </div>

      {message.text && <Message text={message.text} type={message.type} />}
    </div>
  );
}

export default App;
