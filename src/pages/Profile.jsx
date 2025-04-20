import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Avatar from '../components/Avatar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setNewName(data?.user?.user_metadata?.name || '');
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    const { error } = await supabase.auth.updateUser({
      data: { name: newName },
    });

    if (!error) {
      setSuccessMsg('Profile updated successfully!');
    } else {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const newPass = e.target.newPassword.value;
    setSuccessMsg('');

    const { error } = await supabase.auth.updateUser({ password: newPass });

    if (!error) {
      setSuccessMsg('Password updated successfully!');
      e.target.reset();
    } else {
      alert('Error updating password: ' + error.message);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user && (
        <div className="mb-6">
          <Avatar user={user} />
        </div>
      )}

      <p className="text-gray-600 mb-4">
        <strong>Email:</strong> {user?.email}
      </p>

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
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Update Profile
        </button>
      </form>

      <hr className="my-6" />

      <h2 className="text-lg font-bold mb-2">Change Password</h2>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            className="w-full px-3 py-2 border rounded"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Change Password
        </button>
      </form>

      {successMsg && (
        <p className="text-green-600 text-sm mt-4">{successMsg}</p>
      )}
    </div>
  );
};

export default Profile;
