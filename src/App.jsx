import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
  const { session, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!session?.user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users_meta')
        .select('trial_start, subscribed')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { trial_start, subscribed } = data;
      setHasAccess(subscribed || isTrialActive(trial_start));
      setLoading(false);
    };

    checkAccess();
  }, [session, authLoading]);

  if (authLoading || loading) return <div>Loading...</div>;

  return hasAccess ? children : <Navigate to="/pricing" replace />;
};

const AuthRedirect = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return session?.user ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
