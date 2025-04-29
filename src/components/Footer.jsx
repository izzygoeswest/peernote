import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Navigation Links */}
        <nav className="flex space-x-6 mb-4">
          <Link to="/" className="text-sm hover:text-white">
            Home
          </Link>
          <Link to="/pricing" className="text-sm hover:text-white">
            Pricing
          </Link>
          <Link to="/login" className="text-sm hover:text-white">
            Login
          </Link>
          <Link to="/signup" className="text-sm hover:text-white">
            Signup
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-sm mb-2">
          &copy; {new Date().getFullYear()} PeerNote. All rights reserved.
        </p>

        {/* Privacy & Terms */}
        <div className="flex space-x-4 mb-4">
          <Link to="/privacy" className="text-sm hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-sm hover:text-white">
            Terms of Service
          </Link>
        </div>

        {/* Powered By */}
        <div className="text-xs text-gray-400">
          Powered by{' '}
          <a
            href="https://gentle.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-200"
          >
            Gentle AI
          </a>
        </div>
      </div>
    </footer>
  );
}
