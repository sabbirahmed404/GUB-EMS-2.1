import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ParticipantForm } from '../../components/participants/ParticipantForm';

interface Event {
  event_id: string;
  event_name: string;
  organizer_name: string;
  start_date: string;
  end_date: string;
  venue: string;
  status: string;
}

interface Registration {
  participant_id: string;
  event: Event;
  status: string;
  created_at: string;
}

export default function ParticipantDashboard() {
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.user_id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user's registrations
        const { data: userRegistrations, error: registrationsError } = await supabase
          .from('participants')
          .select(`
            participant_id,
            status,
            created_at,
            event:events (
              event_id,
              event_name,
              organizer_name,
              start_date,
              end_date,
              venue
            )
          `)
          .eq('user_id', profile.user_id)
          .returns<Registration[]>();

        if (registrationsError) throw registrationsError;

        // Fetch available events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .returns<Event[]>();

        if (eventsError) throw eventsError;

        // Filter out events user is already registered for
        const registeredEventIds = userRegistrations?.map(reg => reg.event.event_id) || [];
        const availableEventsFiltered = events.filter(
          event => !registeredEventIds.includes(event.event_id)
        ).map(event => ({
          ...event,
          status: calculateEventStatus(event.start_date, event.end_date)
        }));

        setRegistrations(userRegistrations || []);
        setAvailableEvents(availableEventsFiltered);
      } catch (err) {
        console.error('Error fetching participant data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile?.user_id]);

  const calculateEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'running';
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Available Events Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Available Events</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {availableEvents.map((event) => (
              <div 
                key={event.event_id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-lg mb-2">{event.event_name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Organized by: {event.organizer_name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Date: {new Date(event.start_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-4">Venue: {event.venue}</p>
                <button
                  onClick={() => setSelectedEvent(event.event_id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            ))}
            {availableEvents.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No available events found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Event Registration</h2>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4">
              <ParticipantForm 
                eventId={selectedEvent} 
                onSuccess={() => setSelectedEvent(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* User's Registrations Section */}
      <div>
        <h2 className="text-xl font-medium mb-4">My Registrations</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((registration) => (
                <tr key={registration.participant_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registration.event.event_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registration.event.organizer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(registration.event.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      registration.status === 'registered' ? 'bg-green-100 text-green-800' : 
                      registration.status === 'attended' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.status}
                    </span>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 