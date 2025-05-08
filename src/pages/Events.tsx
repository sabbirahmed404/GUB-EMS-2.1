import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { colors } from '../styles/colors';
import { Link } from 'react-router-dom';

// Event interface matching the Supabase events table
interface Event {
  event_id: string;
  eid: string;
  event_name: string;
  organizer_name: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  description: string | null;
  banner_url: string | null;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        
        // Fetch all events from Supabase - now publicly accessible
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: false });
        
        if (error) throw error;
        
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBA';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
                    {/* Add bottom padding */}
                    <div className="pb-[50px]"></div>
        <h1 className="text-3xl font-bold mb-2">Available Events</h1>
        <p className="text-gray-600 mb-8">
          Browse and register for upcoming events at Green University of Bangladesh
        </p>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No events available at this time</h3>
            <p className="text-gray-500 mt-2">Please check back later for upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div 
                key={event.event_id} 
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div 
                  className="h-36 relative" 
                  style={{ 
                    backgroundImage: event.banner_url ? `url(${event.banner_url})` : undefined,
                    backgroundColor: !event.banner_url ? colors.quaternary : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute top-0 left-0 bg-white rounded-br-lg p-2" style={{ backgroundColor: colors.accent, color: 'white' }}>
                    <div className="text-sm font-bold">{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xl font-bold">{new Date(event.start_date).getDate()}</div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    {event.event_name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center" style={{ color: colors.secondary }}>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center" style={{ color: colors.secondary }}>
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                    </div>
                    <div className="flex items-center" style={{ color: colors.secondary }}>
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center" style={{ color: colors.secondary }}>
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.organizer_name}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 flex-1 line-clamp-2 text-sm mb-4">
                    {event.description || "No description available."}
                  </p>
                  <Link 
                    to={`/events/${event.eid}`} 
                    className="w-full mt-auto py-2 px-4 rounded-full text-white font-medium text-center transition-colors duration-300"
                    style={{ backgroundColor: colors.tertiary }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}