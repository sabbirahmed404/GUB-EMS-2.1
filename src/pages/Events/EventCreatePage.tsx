import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EventForm } from '../../components/events/EventForm';

export default function EventCreatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('EventCreatePage mounted');
    
    // Check authentication and authorization
    if (!user || !profile) {
      setError('You must be logged in to create an event');
      navigate('/test-auth');
      return;
    }

    // Check if user has the required role
    if (profile.role !== 'organizer') {
      setError('Only organizers can create events');
      navigate('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [user, profile, navigate]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event creation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Event here, You can Update your Event Information later</h1>
        <EventForm />
      </div>
    </div>
  );
} 