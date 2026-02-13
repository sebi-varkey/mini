import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  // Student operations
  getStudent: (uid) => axios.get(`${API_URL}/student/${uid}`),
  addStudent: (data) => axios.post(`${API_URL}/student`, data),
  
  // Payment operations
  processPayment: (data) => axios.post(`${API_URL}/payment`, data),
  
  // Account operations
  recharge: (data) => axios.post(`${API_URL}/recharge`, data),
  freezeAccount: (data) => axios.post(`${API_URL}/freeze`, data),
  updateDailyLimit: (data) => axios.post(`${API_URL}/daily-limit`, data),
  
  // Transaction history
  getTransactions: (uid) => axios.get(`${API_URL}/transactions/${uid}`)
};
