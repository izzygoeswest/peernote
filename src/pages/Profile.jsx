// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../auth';
import { supabase } from '../supabaseClient';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { session, setSession } = useAuth();
  const user = session?.user;

  const [newName, setNewName] = useState(user?.user_metadata?.name || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Update profile name and refresh session
  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setLoadingName(true);

    const { data, error } = await supabase.auth.updateUser({
      data: { name: newName }
    });

    if (error) {
      setSuccessMsg(error.message);
    } else {
      // Refresh session so header updates
      const {
        data: { session: newSession },
        error: sessionError
      } = await supabase.auth.getSession();
      if (!sessionError) {
        setSession(newSession);
        setSuccessMsg('Profile updated successfully!');
      } else {
        setSuccessMsg('Profile updated; please reload to see changes.');
      }
    }

    setLoadingName(false);
  };

  // Change user password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setLoadingPassword(true);

    const newPassword = e.target.newPassword.value;
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setSuccessMsg(error.message);
    } else {
      setSuccessMsg('Password updated successfully!');
      e.target.reset();
    }

    setLoadingPassword(false);
  };

  if (!user) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Profile</h1>

      {/* Avatar */}
      <div>
        <Avatar user={user} />
      </div>

      {/* Email Display */}
      <p className="text-gray-600">
        <strong>Email:</strong> {user.email}
      </p>

      {/* Update Name Form */}
      <form onSubmit={handleNameUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loadingName}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loadingName ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {/* Change Password Form */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPassword}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loadingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Success / Error Message */}
      {successMsg && (
        <p className="text-green-600 text-sm mt-4">{successMsg}</p>
      )}
    </div>
  );
}
