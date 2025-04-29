// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 py-6 px-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Navigation Links */}
        <nav className="flex space-x-6 mb-4">
          <Link to="/" className="text-sm hover:text-gray-800">
            Home
          </Link>
          <Link to="/pricing" className="text-sm hover:text-gray-800">
            Pricing
          </Link>
          <Link to="/login" className="text-sm hover:text-gray-800">
            Login
          </Link>
          <Link to="/signup" className="text-sm hover:text-gray-800">
            Signup
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-sm mb-2">
          &copy; {new Date().getFullYear()} PeerNote. All rights reserved.
        </p>

        {/* Privacy & Terms */}
        <div className="flex space-x-4 mb-4">
          <Link to="/privacy" className="text-sm hover:text-gray-800">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-sm hover:text-gray-800">
            Terms of Service
          </Link>
        </div>

        {/* Powered By */}
        <div className="text-xs text-gray-500">
          Powered by{' '}
          <a
            href="https://gentleai.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700"
          >
            Gentle AI
          </a>
        </div>
      </div>
    </footer>
  );
}
