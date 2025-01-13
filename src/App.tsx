import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <div className="flex-grow pt-24">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/about" element={<About />} />
                    </Routes>
                  </Suspense>
                </div>
                <Footer />
              </>
            }
          />

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
            <Route path="events" element={<div>Events Management</div>} />
            <Route path="participants" element={<div>Participants Management</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;