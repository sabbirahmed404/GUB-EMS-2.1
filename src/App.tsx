import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import Overview from './pages/dashboard/Overview';
import { TestAuthPage } from './pages/Auth/TestAuthPage';
import EventCreatePage from './pages/Events/EventCreatePage';
import AllEvents from './pages/dashboard/AllEvents';
import EventUpdatePage from './pages/Events/EventUpdatePage';
import EventDetailPage from './pages/Events/EventDetailPage';
import RegistrationDashboard from './pages/Participants/RegistrationDashboard';
import ParticipantsList from './pages/Participants/ParticipantsList'; 
import { CacheProvider } from './contexts/CacheContext';
import { useAuth } from './contexts/AuthContext';
import TeamsDashboard from './pages/Teams/TeamsDashboard';
import PlanningDashboard from './pages/Planning/PlanningDashboard';
import HelpCenter from './pages/Help/HelpCenter';
import SuperAdmin from './pages/dashboard/SuperAdmin';
import NotFound from './pages/NotFound';
import { toast } from 'sonner';

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

function App() {
  return (
    <AuthProvider>
      <CacheProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthRedirect><Outlet /></AuthRedirect>}>
              <Route path="/login" element={<TestAuthPage />} />
              <Route path="/test-auth" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="events" element={<AllEvents />} />
                <Route path="events/create" element={<EventCreatePage />} />
                <Route path="events/:eid/edit" element={<EventUpdatePage />} />
                <Route path="participants" element={<ParticipantsList />} />
                <Route path="registrations" element={<RegistrationDashboard />} />
                <Route path="team" element={<TeamsDashboard />} />
                <Route path="planning" element={<PlanningDashboard />} />
                <Route path="help" element={<HelpCenter />} />
                
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