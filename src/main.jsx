import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './auth';

// 🛡️ Safe fallback for bad `.match()` calls from libraries
const originalMatch = String.prototype.match;
String.prototype.match = function (...args) {
  try {
    return originalMatch.apply(this, args);
  } catch (err) {
    console.warn('Caught unsafe match call:', this, args);
    return null;
  }
};

// 🔐 Global catch for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
