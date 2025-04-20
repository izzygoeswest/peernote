import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="text-center mt-10">Loading...</div>; // Or a spinner
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
