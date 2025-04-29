// src/components/Footer.jsx

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PeerNote. All rights reserved.
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
      <div className="max-w-7xl mx-auto px-4 mt-4 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
        Powered by{' '}
        <a
          href="https://gentleai.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-200"
        >
          Gentle AI
        </a>
      </div>
    </footer>
  );
}
