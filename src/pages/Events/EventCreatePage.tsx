import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EventForm } from '../../components/events/EventForm';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function EventCreatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.group('EventCreatePage Mount');
    console.log('Component State:', { isLoading, error });
    console.log('Auth State:', { user, profile, authLoading });
    console.log('Current Path:', window.location.pathname);

    const checkAuth = async () => {
      try {
        if (authLoading) {
          console.log('Auth is still loading...');
          return;
        }

        if (!user || !profile) {
          console.error('Authentication check failed:', { user, profile });
          setError('You must be logged in to create an event');
          navigate('/test-auth');
          return;
        }

        if (profile.role !== 'organizer' && profile.role !== 'admin') {
          console.error('Role check failed:', { role: profile.role });
          setError('Only organizers and admins can create events');
          navigate('/dashboard');
          return;
        }

        console.log('Auth check passed:', { 
          userId: user.id,
          role: profile.role,
          email: profile.email 
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error in auth check:', err);
        setError('An error occurred while checking authorization');
      }
    };

    checkAuth();
    console.groupEnd();

    // Cleanup
    return () => {
      console.log('EventCreatePage unmounting');
    };
  }, [user, profile, authLoading, navigate]);

  console.log('EventCreatePage render:', { isLoading, error, user: !!user, profile: !!profile });

  if (error) {
    console.warn('Rendering error state:', error);
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (isLoading || authLoading) {
    console.log('Rendering loading state');
    return <LoadingSpinner />;
  }

  console.log('Rendering EventForm');
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <EventForm mode="create" />
    </div>
  );
} 