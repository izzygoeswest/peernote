// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleForgot = async () => {
    setError(''); setMessage('');
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage('Check your inbox for a reset link.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Log In</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
          required
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        <button
          type="submit"
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
        >
          Log In
        </button>

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            type="button"
            onClick={handleForgot}
            className="text-purple-600 hover:underline"
          >
            Forgot password?
          </button>
          <Link to="/signup" className="text-purple-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
