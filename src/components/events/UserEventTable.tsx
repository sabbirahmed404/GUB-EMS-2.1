import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  event_id: string;
  eid: string;
  event_name: string;
  organizer_name: string;
  organizer_code: string;
  venue: string;
  start_date: string;
  end_date: string;
  status: string;
}

type SortField = 'event_name' | 'start_date' | 'status';
type SortOrder = 'asc' | 'desc';

export default function UserEventTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!profile?.user_id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('event_id,eid,event_name,organizer_name,organizer_code,venue,start_date,end_date,created_at')
          .eq('created_by', profile.user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate status dynamically
        const eventsWithStatus = data.map(event => ({
          ...event,
          status: calculateEventStatus(event.start_date, event.end_date)
        }));

        setEvents(eventsWithStatus);
      } catch (error) {
        console.error('Error fetching user events:', error);
        setError('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    if (user && profile) {
      fetchUserEvents();
    }
  }, [user, profile]);

  // Add helper function for status calculation
  const calculateEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'running';
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = 
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eid.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === 'start_date') {
        return sortOrder === 'asc' 
          ? new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          : new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by event name, organizer, or EID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="running">Running</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <Table className="min-w-full">
          <Thead>
            <Tr className="bg-gray-50">
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</Th>
              <Th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('event_name')}
              >
                Event Name {sortField === 'event_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Th>
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</Th>
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</Th>
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</Th>
              <Th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('start_date')}
              >
                Date {sortField === 'start_date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Th>
              <Th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEvents.map((event) => (
              <Tr key={event.event_id} className="hover:bg-gray-50">
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.eid}</Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.event_name}</Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.organizer_name}</Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.organizer_code}</Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.venue}</Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 
                      event.status === 'running' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {event.status}
                  </span>
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => navigate(`/dashboard/events/edit/${event.eid}`)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
} 