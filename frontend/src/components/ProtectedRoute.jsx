import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="grid min-h-screen place-items-center text-uasz-900" role="status">Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/espace" replace />;
  return <Outlet />;
}