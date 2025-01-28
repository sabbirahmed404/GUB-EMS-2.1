import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // Only redirect to login if we're sure there's no authenticated user
  if (!user || !profile) {
    console.log('No user or profile, redirecting to login. Intended path:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}