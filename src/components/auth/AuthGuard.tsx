import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../../components/LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/test-auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 