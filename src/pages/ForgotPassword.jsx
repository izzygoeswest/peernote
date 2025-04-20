import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-200 rounded-full p-3">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Reset Your Password</h1>
          <p className="text-sm text-gray-500 text-center">Enter your email and we’ll send you a link to reset it.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 mt-1 border rounded"
              placeholder="you@example.com"
            />
          </div>

          <button className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600">
            Send Reset Link
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          <Link to="/" className="text-purple-600 font-medium hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
