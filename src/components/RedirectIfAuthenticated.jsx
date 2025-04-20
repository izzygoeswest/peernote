import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const RedirectIfAuthenticated = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
      setChecking(false);
    };
    checkSession();
  }, []);

  if (checking) return <div className="text-center mt-10">Loading...</div>;

  return isAuthed ? <Navigate to="/dashboard" /> : children;
};

export default RedirectIfAuthenticated;
