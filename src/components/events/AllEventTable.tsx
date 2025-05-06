import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, RefreshCw, PlusCircle, Info } from 'lucide-react';
import { useCache } from '../../contexts/CacheContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EventDetailsDrawer } from './EventDetailsDrawer';
import { Button } from '../ui/button';

interface UserEvent {
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  status: string;
  team_name?: string;
}

interface Event {
  event_id: string;
  eid: string;
  event_name: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  created_by: string;
  organizer_name: string;
  organizer_code: string;
  team_id?: string;
  created_at: string;
  status: string;
}

type SortField = 'event_name' | 'start_date' | 'status';
type SortOrder = 'asc' | 'desc';

const getEventPermissions = async (userId: string) => {
  try {
    const { data: teamMemberships, error: teamError } = await supabase
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', userId);

    if (teamError) throw teamError;

    return {
      teamIds: teamMemberships?.map(tm => tm.team_id) || [],
      isAdmin: teamMemberships?.some(tm => tm.role === 'admin') || false
    };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return { teamIds: [], isAdmin: false };
  }
};

const calculateEventStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'running';
};

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
  }
`;

// Add style tag to head
const styleSheet = document.createElement("style");
styleSheet.innerText = responsiveStyles;
document.head.appendChild(styleSheet);

export default function AllEventTable() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { getData, setData, invalidateCache } = useCache();
  const { user, profile } = useAuth();

  // Add debug log for component mount
  useEffect(() => {
    console.log('AllEventTable mounted');
    return () => console.log('AllEventTable unmounted');
  }, []);

  // Add debug log for state changes
  useEffect(() => {
    console.log('AllEventTable state:', {
      eventsLength: events.length,
      loading,
      error,
      user: !!user,
      profile: !!profile
    });
  }, [events, loading, error, user, profile]);

  const fetchAllEvents = async () => {
    if (!user) {
      console.log('No user, skipping fetch');
      return;
    }

    try {
      console.log('Starting fetchAllEvents');
      setLoading(true);
      setError(null);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Fetch response:', { 
        hasData: !!eventsData, 
        dataLength: eventsData?.length || 0,
        hasError: !!eventsError 
      });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw new Error('Failed to fetch events');
      }

      const eventsList = eventsData || [];
      console.log('Setting events:', eventsList.length);
      
      const eventsWithStatus = eventsList.map(event => ({
        ...event,
        status: calculateEventStatus(event.start_date, event.end_date)
      }));

      setEvents(eventsWithStatus);
      setData('all_events', eventsWithStatus);

    } catch (err) {
      console.error('Error in fetchAllEvents:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setEvents([]); // Ensure events is set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('User available, fetching events');
      const cacheKey = 'all_events';
      const cachedData = getData(cacheKey);

      if (cachedData) {
        console.log('Using cached events data');
        setEvents(cachedData);
        setLoading(false);
      } else {
        console.log('No cached data, fetching fresh data');
        fetchAllEvents();
      }
    }
  }, [user]);

  // Add refresh button handler
  const handleRefresh = () => {
    console.log('Manually refreshing all events data');
    invalidateCache('all_events');
    fetchAllEvents();
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = 
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eid.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === 'all') return matchesSearch;
      
      const status = calculateEventStatus(event.start_date, event.end_date);
      return matchesSearch && status === statusFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      if (sortField === 'start_date') {
        return (new Date(aValue).getTime() - new Date(bValue).getTime()) * modifier;
      }
      
      return aValue.localeCompare(bValue) * modifier;
    });

  console.log('Render state:', {
    loading,
    eventsCount: events.length,
    filteredCount: filteredEvents.length,
    searchQuery,
    statusFilter
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
    <div className="w-full space-y-4 px-2 sm:px-4">
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {profile?.role === 'organizer' && (
            <button
              onClick={() => navigate('/dashboard/events/create')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Event</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
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

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No events here yet</p>
          {profile?.role === 'organizer' && (
            <button
              onClick={() => navigate('/dashboard/events/create')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No events match your search criteria</p>
        </div>
      ) : (
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
                  <Th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </Th>
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
                      <div className="text-sm text-gray-900 font-mono">{event.organizer_code}</div>
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
                    <Td className="px-4 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <EventDetailsDrawer 
                          eventId={event.event_id} 
                          trigger={
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600 p-1.5" title="View Event Details">
                              <Info className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
} 