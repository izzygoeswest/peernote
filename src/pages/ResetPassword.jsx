// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPass, setNewPass] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const accessToken = searchParams.get('access_token');

  useEffect(() => {
    if (!accessToken) {
      setError('Invalid or missing token.');
    }
  }, [accessToken]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPass,
    }, { redirectTo: window.location.origin + '/login' });
    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Password updated! Redirecting to login…');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded"
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={!accessToken}
          className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
        >
          Set New Password
        </button>
      </form>
    </div>
  );
}
