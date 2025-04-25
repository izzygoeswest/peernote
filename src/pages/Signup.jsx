import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const redirectUrl = `${window.location.origin}/login`;

    try {
      const { data, error: signupError } = await supabase.auth.signUp(
        { email: formData.email, password: formData.password },
        { redirectTo: redirectUrl }
      );

      if (signupError) {
        setError(signupError.message);
        return;
      }

      // If confirmation required (no session returned)
      if (!data.session && data.user) {
        await supabase.from('users_meta').upsert({ user_id: data.user.id });
        setMessage(
          '🎉 Signup successful! Check your inbox for the confirmation link.'
        );
        return;
      }

      // Otherwise, session exists → user confirmed
      await supabase.from('users_meta').upsert({ user_id: data.user.id });
      navigate('/dashboard');
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setError(err.message || 'Something went wrong — please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-4"
      >
        <h2 className="text-3xl font-extrabold text-center">Create Your Account</h2>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
        {message && (
          <p className="text-green-600 text-sm text-center">{message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition"
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
