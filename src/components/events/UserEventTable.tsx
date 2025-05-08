import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useAuth } from '@/contexts/AuthContext';
import { useCache } from '@/contexts/CacheContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Search, Edit, RefreshCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventDetailsDrawer } from './EventDetailsDrawer';
import { Button } from '../ui/button';

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

// Update the responsive styles for better card layout
const responsiveStyles = `
  /* Custom responsive table styles */
  @media screen and (max-width: 40em) {
    .responsiveTable {
      background: transparent !important;
      border: none !important;
    }

    .responsiveTable tbody tr {
      margin-bottom: 1rem;
      display: block;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .responsiveTable td {
      padding: 0.75rem 1rem !important;
      border-bottom: 1px solid #f3f4f6;
    }

    .responsiveTable td:last-child {
      border-bottom: none;
    }

    .responsiveTable td.pivoted {
      padding: 0.75rem 1rem !important;
      position: relative;
      padding-left: 40% !important;
      display: flex !important;
      align-items: center;
      min-height: 2.5rem;
    }

    .responsiveTable td .tdBefore {
      position: absolute;
      left: 1rem;
      width: 35%;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #6b7280;
      white-space: normal;
    }

    .responsiveTable td .tdContent {
      width: 100% !important;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 0.875rem;
    }

    /* Status badge styles */
    .responsiveTable td .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.75rem;
    }

    /* Action button styles */
    .responsiveTable td .action-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      border-radius: 0.375rem;
      color: #374151;
      font-weight: 500;
      transition: all 0.2s;
    }

    .responsiveTable td .action-button:hover {
      background-color: #e5e7eb;
    }

    .responsiveTable td .action-button svg {
      width: 1rem;
      height: 1rem;
    }
  }
`;

// Add style tag to head
const styleSheet = document.createElement("style");
styleSheet.innerText = responsiveStyles;
document.head.appendChild(styleSheet);

export default function UserEventTable() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { user, profile } = useAuth();
  const { getData, setData, invalidateCache } = useCache();
  const navigate = useNavigate();

  const fetchUserEvents = async () => {
    if (!profile?.user_id) return;
    
    try {
      console.log('Fetching user events for:', profile.user_id);
      setLoading(true);

      // Fetch only events created by the user
      const { data: createdEvents, error: createdError } = await supabase
        .from('events')
        .select('event_id,eid,event_name,organizer_name,organizer_code,venue,start_date,end_date,created_at')
        .eq('created_by', profile.user_id)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Calculate status dynamically
      const eventsWithStatus = createdEvents.map(event => ({
        ...event,
        status: calculateEventStatus(event.start_date, event.end_date)
      }));

      // Store in cache with 5-minute expiration
      const cacheKey = `user_events_${profile.user_id}`;
      setData(cacheKey, eventsWithStatus, 5 * 60 * 1000); // 5 minutes
      setEvents(eventsWithStatus);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile?.user_id) return;

    const cacheKey = `user_events_${profile.user_id}`;
    const cachedData = getData(cacheKey);

    if (cachedData) {
      console.log('Using cached events data');
      setEvents(cachedData);
      setLoading(false);
      
      // Refresh cache in background after 5 minutes
      const refreshTimeout = setTimeout(() => {
        console.log('Cache expired, refreshing data');
        invalidateCache(cacheKey);
        fetchUserEvents();
      }, 5 * 60 * 1000);

      return () => clearTimeout(refreshTimeout);
    } else {
      console.log('No cached data, fetching fresh data');
      fetchUserEvents();
    }
  }, [profile?.user_id]);

  // Add refresh button handler
  const handleRefresh = () => {
    if (!profile?.user_id) return;
    console.log('Manually refreshing events data');
    invalidateCache(`user_events_${profile.user_id}`);
    fetchUserEvents();
  };

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

  // Add the details button to the Actions column of the table
  const actionsCell = (event: Event) => {
    // Check if this is an event created by the current user
    const isUserEvent = (organizerCode: string) => {
      if (!profile || !profile.organizer_code) return false;
      return profile.organizer_code === organizerCode;
    };
    
    // Check if user can edit (must be organizer role and own the event, or admin)
    const canEdit = (organizerCode: string) => {
      if (!profile) return false;
      if (profile.role === 'admin') return true; // Admins can edit any event
      return profile.role === 'organizer' && profile.organizer_code === organizerCode;
    };
    
    return (
      <div className="flex items-center space-x-2">
        <EventDetailsDrawer 
          eventId={event.event_id} 
          trigger={
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 p-1.5" title="View Event Details">
              <Info className="h-4 w-4" />
            </Button>
          }
        />
        {canEdit(event.organizer_code) && (
          <Button
            onClick={() => navigate(`/dashboard/events/${event.eid}/edit`)}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 border border-green-200"
            title="Edit Event"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span>Edit</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by event name, organizer, or EID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
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
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-hidden">
          <Table className="w-full divide-y divide-gray-200">
            <Thead className="bg-gray-50">
              <Tr>
                <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</Th>
                <Th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('event_name')}
                >
                  Name {sortField === 'event_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Th>
                <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Org.</Th>
                <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</Th>
                <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</Th>
                <Th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('start_date')}
                >
                  Date {sortField === 'start_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Th>
                <Th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Th>
                <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</Th>
              </Tr>
            </Thead>
            <Tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <Tr key={event.event_id} className="hover:bg-gray-50">
                  <Td className="px-4 py-4 text-sm text-gray-500 font-medium">{event.eid.split('-')[1]}</Td>
                  <Td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.event_name}</div>
                  </Td>
                  <Td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{event.organizer_name}</div>
                  </Td>
                  <Td className="px-4 py-4">
                    <div className="text-sm font-mono text-gray-900">{event.organizer_code}</div>
                  </Td>
                  <Td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{event.venue}</div>
                  </Td>
                  <Td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(event.start_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </Td>
                  <Td className="px-4 py-4">
                    <span className={`status-badge px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 
                        event.status === 'running' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {event.status}
                    </span>
                  </Td>
                  <Td className="px-4 py-4 text-sm text-gray-500">
                    {actionsCell(event)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
} 