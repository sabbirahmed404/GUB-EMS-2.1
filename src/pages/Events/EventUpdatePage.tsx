import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EventForm } from '../../components/events/EventForm';

// Define type for route parameters
type EventRouteParams = {
  eid: string;
};

export default function EventUpdatePage() {
  // Get route parameters
  const params = useParams<EventRouteParams>();
  const eid = params.eid;  // This should now work correctly
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);

  // Log component mount and initial state
  useEffect(() => {
    console.group('EventUpdatePage Mount');
    console.log('Route Parameters:', {
      params,
      eid,
      currentPath: window.location.pathname
    });
    console.log('Initial State:', {
      eid,
      profileExists: !!profile,
      userId: profile?.user_id,
      loading,
      error,
      hasEvent: !!event
    });
    console.groupEnd();

    return () => {
      console.log('EventUpdatePage Unmount');
    };
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      console.group('Event Fetch Process');
      
      if (!profile?.user_id || !eid) {
        console.log('Missing requirements:', { 
          hasProfile: !!profile, 
          userId: profile?.user_id, 
          eid,
          currentPath: window.location.pathname
        });
        setError('Invalid request - Missing event ID or user profile');
        setLoading(false);
        console.groupEnd();
        return;
      }

      try {
        console.log('Starting event fetch:', { 
          eid,
          userId: profile.user_id 
        });
        
        // Fetch event data
        console.log('Fetching event data...');
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('eid', eid)
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          throw eventError;
        }

        if (!eventData) {
          console.error('Event not found:', { eid });
          throw new Error(`Event not found with ID: ${eid}`);
        }

        console.log('Event data received:', { 
          eventId: eventData.event_id,
          eventName: eventData.event_name,
          createdBy: eventData.created_by,
          eid: eventData.eid
        });

        // Verify if user has permission to edit this event
        if (eventData.created_by !== profile.user_id && profile.role !== 'admin') {
          console.error('Permission denied:', { 
            eventCreator: eventData.created_by, 
            currentUser: profile.user_id,
            userRole: profile.role
          });
          throw new Error('You do not have permission to update this event');
        }

        // Then fetch event details
        console.log('Fetching event details...');
        const { data: detailsData, error: detailsError } = await supabase
          .from('event_details')
          .select('*')
          .eq('event_id', eventData.event_id)
          .single();

        if (detailsError && detailsError.code !== 'PGRST116') {
          console.error('Error fetching event details:', detailsError);
          throw detailsError;
        }

        console.log('Event details received:', {
          hasDetails: !!detailsData,
          detailsFields: detailsData ? Object.keys(detailsData) : []
        });

        // Combine event data with details
        const combinedEventData = {
          ...eventData,
          details: detailsData || {}
        };

        console.log('Setting combined event data:', {
          hasBaseData: true,
          hasDetails: !!detailsData,
          totalFields: Object.keys(combinedEventData).length
        });

        setEvent(combinedEventData);
        console.log('Event data successfully set in state');
      } catch (err) {
        console.error('Error in fetchEvent:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
        console.log('Final state:', { 
          loading: false, 
          hasError: !!error, 
          hasEvent: !!event,
          currentEid: eid
        });
        console.groupEnd();
      }
    };

    // Reset states when eid changes
    setLoading(true);
    setError(null);
    setEvent(null);
    
    fetchEvent();
  }, [eid, profile?.user_id]);

  // Log state changes
  useEffect(() => {
    console.log('State Update:', {
      loading,
      hasError: !!error,
      errorMessage: error,
      hasEvent: !!event,
      eventId: event?.event_id,
      currentPath: window.location.pathname,
      currentEid: eid
    });
  }, [loading, error, event]);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => navigate('/dashboard/events')}
            className="mt-3 bg-red-100 text-red-800 px-4 py-2 rounded hover:bg-red-200 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    console.log('Rendering empty event state');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Event not found</span>
          <button
            onClick={() => navigate('/dashboard/events')}
            className="mt-3 bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering event form with data:', {
    eventId: event.event_id,
    eventName: event.event_name,
    hasDetails: !!event.details,
    eid: event.eid
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Update Event</h1>
        <button
          onClick={() => navigate('/dashboard/events')}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Back to Events
        </button>
      </div>
      <EventForm mode="update" initialData={event} />
    </div>
  );
} 