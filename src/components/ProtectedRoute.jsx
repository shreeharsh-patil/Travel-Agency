import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, admin = false }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, allowed: false });
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me').then(async (res) => ({ data: res.ok ? await res.json() : null })).then(({ data }) => {
      if (active) setState({ loading: false, allowed: Boolean(data?.user) && (!admin || data.user?.role === 'admin') });
    }).catch(() => active && setState({ loading: false, allowed: false }));
    return () => { active = false; };
  }, [admin]);
  if (state.loading) return <div className="min-h-screen bg-[#0c0c0c]" />;
  if (!state.allowed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
