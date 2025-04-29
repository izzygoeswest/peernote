import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
  FiGrid,
  FiX,
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
  { label: 'Contacts', path: '/contacts', icon: <FiUsers /> },
  { label: 'Reminders', path: '/reminders', icon: <FiBell /> },
];

const accountItems = [
  { label: 'Settings', path: '/settings', icon: <FiSettings /> },
  { label: 'Profile', path: '/profile', icon: <FiUser /> },
];

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 h-full bg-white shadow-md flex flex-col sticky top-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-lg font-bold">Navigation</h1>
        <button
        onClick={onToggle}
        aria-label="Close sidebar"
        className="text-gray-500 hover:text-black md:hidden"
      >
          <FiX />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
              isActive(item.path)
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        <hr className="my-3" />

        <p className="text-xs text-gray-400 px-3 uppercase">Account</p>

        {accountItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
              isActive(item.path)
                ? 'bg-purple-100 text-purple-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
