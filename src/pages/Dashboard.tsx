import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useLocation, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    console.group('Dashboard Mount');
    console.log('Auth State:', {
      isAuthenticated: !!user,
      hasProfile: !!profile,
      isLoading: loading,
      userRole: profile?.role,
      userEmail: user?.email
    });
    console.log('Current Path:', location.pathname);
    console.groupEnd();

    // Set initial load to false after first mount
    if (initialLoad && user && profile) {
      setInitialLoad(false);
    }

    return () => {
      console.log('Dashboard unmounting');
    };
  }, [user, profile, loading, location, initialLoad]);

  // Only show loading spinner on initial load or when explicitly loading
  if ((initialLoad && loading) || (!user && loading)) {
    console.log('Dashboard: Loading state');
    return <LoadingSpinner />;
  }

  if (!profile) {
    console.error('Dashboard: No profile found');
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        Error loading user profile
      </div>
    );
  }

  console.log('Dashboard: Rendering layout with Outlet');
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}