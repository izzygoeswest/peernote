// src/pages/Signup.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setMessage('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Force confirmation links to redirect to /login
    const redirectUrl = `${window.location.origin}/login`;

    const { data, error: signupError } = await supabase.auth.signUp(
      { email: formData.email, password: formData.password },
      { redirectTo: redirectUrl }
    );

    if (signupError) {
      // Rate‐limit or other error
      if (signupError.status === 429) {
        setError('Too many attempts—please wait a few minutes.');
      } else {
        setError(signupError.message);
      }
      return;
    }

    // If no session returned, email confirmation is required
    if (!data.session && data.user) {
      // Create or update your trial metadata
      await supabase.from('users_meta').upsert({ user_id: data.user.id });
      setMessage('✅ Signup successful! Check your inbox for the confirmation link.');
      return;
    }

    // Otherwise the user is already confirmed (rare if email confirmations off)
    await supabase.from('users_meta').upsert({ user_id: data.user.id });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-4"
      >
        <h2 className="text-3xl font-bold text-center">Sign Up</h2>

        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>

        {(error || message) && (
          <p
            className={`text-center text-sm ${
              error ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {error || message}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-purple-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
