import { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  filter?: string;
  searchQuery?: string;
}

export const EventTable = ({ filter, searchQuery }: EventTableProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Event>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !profile) {
        navigate('/test-auth');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('events')
          .select('*');

        if (searchQuery) {
          query = query.or(`event_name.ilike.%${searchQuery}%,organizer_name.ilike.%${searchQuery}%`);
        }

        query = query.order('start_date', { ascending: sortDirection === 'asc' });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (mounted && data) {
          // Calculate status for each event
          const eventsWithStatus = data.map(event => ({
            ...event,
            status: calculateEventStatus(event.start_date, event.end_date)
          }));

          // Apply status filter in memory if needed
          const filteredEvents = filter
            ? eventsWithStatus.filter(event => event.status === filter)
            : eventsWithStatus;

          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load events');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, [user, profile, authLoading, filter, searchQuery, sortField, sortDirection, navigate]);

  const handleSort = (field: keyof Event) => {
    setSortDirection(current => field === sortField ? (current === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortField(field);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'ongoing';
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!loading && events.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto min-w-full">
        <Table className="min-w-full divide-y divide-gray-200">
          <Thead>
            <Tr className="bg-gray-50">
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
            </Tr>
          </Thead>
          <Tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
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
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                    event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}; 