import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { email, password } = formData;
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-200 rounded-full p-3">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold mt-2">Create an Account</h1>
          <p className="text-sm text-gray-500">Start strengthening your relationships</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 mt-1 border rounded"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link to="/" className="text-purple-600 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
