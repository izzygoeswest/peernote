// src/components/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PeerNote. All rights reserved. Powered by <a href="https://gentleai.tech/">Gentle AI</a>
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/privacy" className="text-sm hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
