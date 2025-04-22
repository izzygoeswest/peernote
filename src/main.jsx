import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
console.log("🚀 main.jsx loaded");  // sanity check that this script runs
import './index.css';
import { AuthProvider } from './auth';

// 🔐 Global catch for any unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
