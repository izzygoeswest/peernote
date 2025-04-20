import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Sidebar from './components/Sidebar';
import { useAuth } from './auth';

const App = () => {
  const { session } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!session) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const PublicOnlyRoute = ({ children }) => {
    if (session) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Show sidebar only if logged in */}
        {session && <Sidebar />}

        <div className="flex-1 p-4">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
