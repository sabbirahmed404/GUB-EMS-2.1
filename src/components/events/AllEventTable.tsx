import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, RefreshCw, PlusCircle, Info } from 'lucide-react';
import { useCache } from '../../contexts/CacheContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventDetailsDrawer from './EventDetailsDrawer';

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
  const { user } = useAuth();
  const { cache, setCache } = useCache();
  
  const [events, setEvents] = useState<Event[]>(cache.allEvents || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Event>('start_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [sortField, sortOrder]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });
      
      if (fetchError) throw fetchError;
      
      setEvents(data as Event[]);
      setCache({ ...cache, allEvents: data as Event[] });
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field: keyof Event) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.event_name.toLowerCase().includes(searchLower) ||
      event.organizer_name.toLowerCase().includes(searchLower) ||
      event.organizer_code.toLowerCase().includes(searchLower) ||
      event.venue.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower))
    );
  });

  const openEventDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-lg font-medium text-gray-900">All Events</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchEvents}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-6">
          <LoadingSpinner />
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 
                          event.status === 'running' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                    </Td>
                    <Td className="px-4 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => openEventDetails(event.event_id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
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
        </div>
      )}
      
      {selectedEventId && (
        <EventDetailsDrawer
          eventId={selectedEventId}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
} 