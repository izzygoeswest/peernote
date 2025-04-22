import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './auth';

// 🛡️ Global fix: prevent `.match()` from crashing when called on undefined/null
const originalMatch = String.prototype.match;
String.prototype.match = function (...args) {
  if (typeof this !== 'string') {
    console.warn('Skipping .match() on non-string:', this);
    return null;
  }
  return originalMatch.apply(this, args);
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
