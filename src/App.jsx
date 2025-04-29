// src/App.jsx

import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { FiMenu } from 'react-icons/fi';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import { useAuth } from './auth';
import { supabase } from './supabaseClient';
import { isTrialActive } from './utils/checkTrialStatus';

// Banner for expired users
const ExpiredBanner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded shadow-lg text-center">
      <p className="text-lg">
        Your free 7-day trial has expired.{' '}
        <a href="/pricing" className="underline font-semibold text-blue-600">
          Upgrade now
        </a>{' '}
        to regain access.
      </p>
    </div>
  </div>
);

function AppLayout({ children }) {
  const location = useLocation();
  const { session } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Hide sidebar on these routes
  const noSidebarRoutes = ['/', '/login', '/signup', '/pricing'];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => setSidebarOpen(false), [location.pathname]);

  // Determine display name (profile name or fallback to email)
  const displayName =
    session?.user?.user_metadata?.name || session?.user?.email;
  const displayInitial = displayName?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar: off-canvas on mobile, static on desktop */}
        {!hideSidebar && (
          <div
            className={
              'fixed inset-y-0 left-0 bg-white shadow-md z-50 transform ' +
              (isSidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full') +
              ' md:translate-x-0 md:static md:inset-auto transition-transform duration-200'
            }
          >
            <Sidebar onToggle={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between bg-white shadow-sm px-8 md:px-16 py-4">
            {!hideSidebar && (
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
            )}

            <div className="flex-1 flex justify-end">
              {displayName && (
                <div className="flex items-center space-x-3 pr-12">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    {displayInitial}
                  </div>
                  <span className="text-gray-700 break-words">
                    {displayName}
                  </span>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { session } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setHasAccess(false);
      setLoading(false);
      return;
    }
    supabase
      .from('users_meta')
      .select('trial_start, subscribed')
      .eq('user_id', session.user.id)
      .single()
      .then(async ({ data, error }) => {
        if (error && error.code === 'PGRST116') {
          await supabase
            .from('users_meta')
            .upsert({ user_id: session.user.id }, { onConflict: 'user_id' });
          setHasAccess(true);
        } else if (data) {
          setHasAccess(
            data.subscribed || isTrialActive(data.trial_start)
          );
        } else {
          setHasAccess(false);
        }
      })
      .catch(() => setHasAccess(false))
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (!hasAccess) return <ExpiredBanner />;
  return children;
}

function AuthRedirect({ children }) {
  const { session } = useAuth();
  return session ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRedirect>
                <Signup />
              </AuthRedirect>
            }
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
