import React, { useState } from 'react';
import { api } from '../api';

function AdminPanel({ showMessage }) {
  const [studentData, setStudentData] = useState({
    uid: '',
    name: '',
    balance: '',
    daily_limit: ''
  });
  const [rechargeData, setRechargeData] = useState({ uid: '', amount: '' });
  const [freezeUid, setFreezeUid] = useState('');
  const [limitData, setLimitData] = useState({ uid: '', daily_limit: '' });

  const addStudent = async () => {
    if (!studentData.uid || !studentData.name) {
      showMessage('UID and Name are required', 'error');
      return;
    }

    try {
      await api.addStudent({
        uid: studentData.uid,
        name: studentData.name,
        balance: parseFloat(studentData.balance) || 0,
        daily_limit: parseFloat(studentData.daily_limit) || 500
      });
      showMessage('Student added successfully!');
      setStudentData({ uid: '', name: '', balance: '', daily_limit: '' });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Error adding student', 'error');
    }
  };

  const rechargeAccount = async () => {
    if (!rechargeData.uid || !rechargeData.amount) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      const response = await api.recharge({
        uid: rechargeData.uid,
        amount: parseFloat(rechargeData.amount)
      });
      showMessage(`Recharged! New balance: ₹${response.data.new_balance.toFixed(2)}`);
      setRechargeData({ uid: '', amount: '' });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Error recharging account', 'error');
    }
  };

  const freezeAccount = async (freeze) => {
    if (!freezeUid) {
      showMessage('Please enter UID', 'error');
      return;
    }

    try {
      await api.freezeAccount({ uid: freezeUid, freeze });
      showMessage(`Account ${freeze ? 'frozen' : 'unfrozen'} successfully!`);
    } catch (error) {
      showMessage(error.response?.data?.error || 'Error updating account', 'error');
    }
  };

  const updateLimit = async () => {
    if (!limitData.uid || !limitData.daily_limit) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    try {
      await api.updateDailyLimit({
        uid: limitData.uid,
        daily_limit: parseFloat(limitData.daily_limit)
      });
      showMessage(`Daily limit updated to ₹${limitData.daily_limit}`);
      setLimitData({ uid: '', daily_limit: '' });
    } catch (error) {
      showMessage(error.response?.data?.error || 'Error updating limit', 'error');
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <div className="card">
        <h3>➕ Add/Update Student</h3>
        <input
          type="text"
          placeholder="Student UID"
          value={studentData.uid}
          onChange={(e) => setStudentData({ ...studentData, uid: e.target.value })}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentData.name}
          onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Initial Balance"
          value={studentData.balance}
          onChange={(e) => setStudentData({ ...studentData, balance: e.target.value })}
        />
        <input
          type="number"
          placeholder="Daily Limit (default: 500)"
          value={studentData.daily_limit}
          onChange={(e) => setStudentData({ ...studentData, daily_limit: e.target.value })}
        />
        <button onClick={addStudent}>Add Student</button>
      </div>

      <div className="card">
        <h3>🔄 Recharge Account</h3>
        <input
          type="text"
          placeholder="Student UID"
          value={rechargeData.uid}
          onChange={(e) => setRechargeData({ ...rechargeData, uid: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount to Add"
          value={rechargeData.amount}
          onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
        />
        <button onClick={rechargeAccount}>Recharge</button>
      </div>

      <div className="card">
        <h3>❄️ Freeze/Unfreeze Account</h3>
        <input
          type="text"
          placeholder="Student UID"
          value={freezeUid}
          onChange={(e) => setFreezeUid(e.target.value)}
        />
        <button
          onClick={() => freezeAccount(true)}
          style={{ background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' }}
        >
          ❄️ Freeze Account
        </button>
        <button
          onClick={() => freezeAccount(false)}
          style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}
        >
          ✓ Unfreeze Account
        </button>
      </div>

      <div className="card">
        <h3>💰 Update Daily Limit</h3>
        <input
          type="text"
          placeholder="Student UID"
          value={limitData.uid}
          onChange={(e) => setLimitData({ ...limitData, uid: e.target.value })}
        />
        <input
          type="number"
          placeholder="New Daily Limit"
          value={limitData.daily_limit}
          onChange={(e) => setLimitData({ ...limitData, daily_limit: e.target.value })}
        />
        <button onClick={updateLimit}>Update Limit</button>
      </div>
    </div>
  );
}

export default AdminPanel;
