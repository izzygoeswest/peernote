import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Reminders from './pages/Reminders';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Home from './pages/Home';
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

const AppLayout = ({ children }) => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/login', '/signup', '/pricing'];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
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
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase error fetching meta:', error);
          if (error.code === 'PGRST116') {
            // No row exists yet: create it and allow trial
            supabase
              .from('users_meta')
              .insert({ user_id: session.user.id })
              .then(() => setHasAccess(true))
              .finally(() => setLoading(false));
            return;
          }
          // Any other error → treat as expired
          setHasAccess(false);
        } else {
          const { trial_start, subscribed } = data;
          setHasAccess(subscribed || isTrialActive(trial_start));
        }
      })
      .catch((err) => {
        console.error('Unexpected error fetching meta:', err);
        setHasAccess(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session]);

  if (loading) return <div>Loading...</div>;
  if (!hasAccess) return <ExpiredBanner />;
  return children;
};

const AuthRedirect = ({ children }) => {
  const { session } = useAuth();
  return session ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
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

export default App;
