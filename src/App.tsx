import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Overview from './pages/dashboard/Overview';
import { TestAuthPage } from './pages/Auth/TestAuthPage';
import EventCreatePage from './pages/Events/EventCreatePage';
import AllEvents from './pages/dashboard/AllEvents';
import EventUpdatePage from './pages/Events/EventUpdatePage';

function PublicLayout() {
  useEffect(() => {
    console.log('PublicLayout mounted');
    return () => console.log('PublicLayout unmounted');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow pt-24">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth test route */}
          <Route path="/test-auth" element={<TestAuthPage />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="events" element={<AllEvents />} />
            <Route 
              path="events/create" 
              element={
                <ProtectedRoute>
                  <EventCreatePage />
                </ProtectedRoute>
              } 
            />
            <Route path="participants" element={<div>Participants Management</div>} />
            <Route path="settings" element={<div>Settings</div>} />
            <Route path="events/edit/:eid" element={<EventUpdatePage />} />
          </Route>

          {/* Public routes with layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;