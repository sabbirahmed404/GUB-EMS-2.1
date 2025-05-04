import { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import EventDetailsDrawer from './EventDetailsDrawer';

interface Event {
  event_id: string;
  eid: string;
  event_name: string;
  organizer_name: string;
  start_date: string;
  end_date: string;
  venue: string;
  status: string;
}

interface EventTableProps {
  filter?: 'my_events' | 'all_events';
  searchQuery?: string;
}

export const EventTable = ({ filter = 'all_events', searchQuery = '' }: EventTableProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('events')
          .select('event_id, eid, event_name, organizer_name, start_date, end_date, venue, status')
          .order(sortField, { ascending: sortDirection === 'asc' });

        if (filter === 'my_events' && user) {
          query = query.eq('created_by', user.id);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        setEvents(data as Event[]);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, filter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.event_name.toLowerCase().includes(searchLower) ||
      event.organizer_name.toLowerCase().includes(searchLower) ||
      event.venue.toLowerCase().includes(searchLower) ||
      event.status.toLowerCase().includes(searchLower)
    );
  });

  const openEventDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (filteredEvents.length === 0) {
    return <div className="text-center py-4">No events found</div>;
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <Thead className="bg-gray-50">
            <Tr>
              <Th 
                onClick={() => handleSort('event_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Event Name {sortField === 'event_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('organizer_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Organizer {sortField === 'organizer_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('start_date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Date {sortField === 'start_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('venue')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Venue {sortField === 'venue' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <Tr 
                key={event.event_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.event_name}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.organizer_name}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(event.start_date)}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.venue}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                    event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEventDetails(event.event_id)}
                    className="text-blue-600 hover:text-blue-900 mr-4 flex items-center"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    <span>Details</span>
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      
      {selectedEventId && (
        <EventDetailsDrawer
          eventId={selectedEventId}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}; 