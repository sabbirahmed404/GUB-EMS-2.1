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
import RegistrationDashboard from './pages/Participants/RegistrationDashboard';
import ParticipantsList from './pages/Participants/ParticipantsList'; 
import { CacheProvider } from './contexts/CacheContext';
import { useAuth } from './contexts/AuthContext';
import TeamsDashboard from './pages/Teams/TeamsDashboard';
import PlanningDashboard from './pages/Planning/PlanningDashboard';
import HelpCenter from './pages/Help/HelpCenter';

function PublicLayout() {
  useEffect(() => {
    console.log('PublicLayout mounted');
    return () => console.log('PublicLayout unmounted');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow pt-24">
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
              </Route>
            </Route>

            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CacheProvider>
    </AuthProvider>
  );
}

export default App;