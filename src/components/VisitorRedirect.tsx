import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './common/LoadingSpinner';

export default function VisitorRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile?.role === 'visitor') {
      navigate('/dashboard/visitor');
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return <Navigate to="/login" />;
  }

  if (profile.role === 'visitor') {
    return <Navigate to="/dashboard/visitor" />;
  }

  // Non-visitor users proceed normally
  return null;
} 