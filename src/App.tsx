import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import MyEvents from './pages/dashboard/MyEvents';
import { TestAuthPage } from './pages/Auth/TestAuthPage';
import LoginPage from './pages/Auth/LoginPage';
import EventCreatePage from './pages/Events/EventCreatePage';
import AllEvents from './pages/dashboard/AllEvents';
import EventUpdatePage from './pages/Events/EventUpdatePage';
import EventDetailPage from './pages/Events/EventDetailPage';
import RegistrationDashboard from './pages/Participants/RegistrationDashboard';
import ParticipantsList from './pages/Participants/ParticipantsList'; 
import { CacheProvider } from './contexts/CacheContext';
import { useAuth } from './contexts/AuthContext';
import HelpCenter from './pages/Help/HelpCenter';
import SuperAdmin from './pages/dashboard/SuperAdmin';
import OrganizersList from './pages/Organizers/OrganizersList';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import { toast } from 'sonner';
import VisitorRedirect from './components/VisitorRedirect';

// Route tracker component to set data-route attribute on body
function RouteTracker() {
  const location = useLocation();
  
  useEffect(() => {
    // Set the data-route attribute on the body element
    document.body.setAttribute('data-route', location.pathname);
    
    return () => {
      // Clean up when component unmounts
      document.body.removeAttribute('data-route');
    };
  }, [location.pathname]);
  
  return null;
}

// Helper component to fix viewport height issues on mobile
function ViewportFixer() {
  useEffect(() => {
    // Function to update viewport height CSS variable with fixed 100vh calculation
    const updateViewportHeight = () => {
      // Get the viewport height more accurately for mobile
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      // iOS specific fix for PWA 
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Force redraw to prevent white space at bottom
        document.body.style.display = 'none';
        // This triggers a reflow
        void document.body.offsetHeight;
        document.body.style.display = '';
      }
    };

    // Initial call
    updateViewportHeight();

    // Update on window resize and orientation change
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', () => {
      // For orientation changes, we need a slight delay
      setTimeout(updateViewportHeight, 100);
    });

    // Update when page becomes visible or scrolled
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateViewportHeight();
      }
    });
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', () => {});
      document.removeEventListener('visibilitychange', () => {});
    };
  }, []);

  return null;
}

// Public layout component
function PublicLayout() {
  useEffect(() => {
    console.log('PublicLayout mounted');
    return () => console.log('PublicLayout unmounted');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// Redirect authenticated users away from auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const isAuthenticated = user && profile;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Role-based access control for admin routes (organizer or admin)
function AdminRoute() {
  const { profile, loading } = useAuth();
  
  // Debug information
  console.log('AdminRoute check:', {
    role: profile?.role,
    loading,
    canAccess: profile?.role === 'admin' || profile?.role === 'organizer'
  });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'organizer')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}

// Role-based access control specifically for super admin routes (admin only)
function SuperAdminRoute() {
  const { profile, loading } = useAuth();
  
  // Debug information
  console.log('SuperAdminRoute check:', {
    role: profile?.role,
    loading,
    canAccess: profile?.role === 'admin'
  });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!profile || profile.role !== 'admin') {
    toast.error("Access denied. Only administrators can access this page.");
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}

// Role-based access control for non-visitor routes (organizer or admin)
function NonVisitorRoute() {
  const { profile, loading } = useAuth();
  
  // Debug information
  console.log('NonVisitorRoute check:', {
    role: profile?.role,
    loading,
    canAccess: profile?.role !== 'visitor'
  });
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!profile || profile.role === 'visitor') {
    toast.error("Access denied. Visitors cannot access this page.");
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <CacheProvider>
        <Router>
          <RouteTracker />
          <ViewportFixer />
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthRedirect><Outlet /></AuthRedirect>}>
              <Route path="/login" element={<TestAuthPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/test-auth" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />}>
                {/* My Events route only accessible to organizers and admins */}
                <Route element={<NonVisitorRoute />}>
                  <Route index element={<MyEvents />} />
                </Route>
                
                {/* Fallback redirection for visitors */}
                <Route path="" element={<VisitorRedirect />} />
                
                {/* Fallback for visitors who can't access My Events */}
                <Route path="visitor" element={<AllEvents />} />
                
                <Route path="events" element={<AllEvents />} />
                <Route path="registrations" element={<RegistrationDashboard />} />
                <Route path="organizers" element={<OrganizersList />} />
                <Route path="help" element={<HelpCenter />} />
                
                {/* Routes accessible only to non-visitors (organizer and admin) */}
                <Route element={<NonVisitorRoute />}>
                  <Route path="participants" element={<ParticipantsList />} />
                  <Route path="events/create" element={<EventCreatePage />} />
                  <Route path="events/:eid/edit" element={<EventUpdatePage />} />
                </Route>
                
                {/* Admin routes with role protection (organizer or admin) */}
                <Route element={<AdminRoute />}>
                  {/* Routes that both organizer and admin can access */}
                </Route>
                
                {/* Super Admin routes with admin-only role protection */}
                <Route element={<SuperAdminRoute />}>
                  <Route path="admin" element={<SuperAdmin />} />
                  <Route path="superadmin" element={<SuperAdmin />} />
                </Route>
                
                {/* 404 for dashboard routes that don't exist */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eid" element={<EventDetailPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
            </Route>

            {/* Catch all route - show 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CacheProvider>
    </AuthProvider>
  );
}

export default App;