import { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EventDetailsDrawer } from './EventDetailsDrawer';
import { Info, Edit, X, Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog } from '@headlessui/react';
import { EventForm } from './EventForm';

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
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

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
          console.log("Events loaded:", filteredEvents.length);
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

  const handleEdit = async (eventId: string) => {
    console.log("Edit button clicked for event:", eventId);
    setLoadingEdit(true);
    setEditEventId(eventId);
    setShowEditForm(true);
    
    try {
      // Fetch complete event details for editing
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', eventId)
        .single();
        
      if (eventError) throw eventError;
      
      // Fetch event details
      const { data: detailsData, error: detailsError } = await supabase
        .from('event_details')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();
      
      if (detailsError) throw detailsError;
      
      // Combine both datasets
      const completeEventData = {
        ...eventData,
        details: detailsData
      };
      
      console.log("Event data loaded for edit:", eventData.event_name);
      setEventToEdit(completeEventData);
    } catch (err) {
      console.error('Error fetching event for edit:', err);
      // You could show an error message here
      setShowEditForm(false);
    } finally {
      setLoadingEdit(false);
    }
  };

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
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-blue-100">
      <div className="overflow-x-auto min-w-full">
        <Table className="min-w-full divide-y divide-blue-100">
          <Thead>
            <Tr className="bg-blue-800 text-white">
              <Th 
                onClick={() => handleSort('event_name')}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 text-blue-50"
              >
                Event Name {sortField === 'event_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('organizer_name')}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 text-blue-50"
              >
                Organizer {sortField === 'organizer_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('start_date')}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 text-blue-50"
              >
                Date {sortField === 'start_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('venue')}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 text-blue-50"
              >
                Venue {sortField === 'venue' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th 
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-blue-700 text-blue-50"
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-blue-50">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody className="bg-white divide-y divide-blue-50">
            {events.map((event) => (
              <Tr 
                key={event.event_id}
                className="hover:bg-blue-50 transition-colors"
              >
                <Td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                  {event.event_name}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700">
                  {event.organizer_name}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  {event.venue}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
                      event.status === 'ongoing' ? 'bg-blue-400 text-white' : 
                      'bg-blue-200 text-blue-700'}`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-blue-50">
                  <div className="flex space-x-2">
                    <EventDetailsDrawer 
                      eventId={event.event_id} 
                      trigger={
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Info className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      }
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:bg-green-50 border-green-200"
                      onClick={() => handleEdit(event.event_id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      
      {/* Edit Event Form Dialog */}
      <Dialog
        open={showEditForm}
        onClose={() => {
          if (!loadingEdit) {
            setShowEditForm(false);
            setEventToEdit(null);
            setEditEventId(null);
          }
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden mobile-dialog flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-lg font-medium">
                {loadingEdit ? "Loading Event..." : "Edit Event"}
              </Dialog.Title>
              <button 
                onClick={() => {
                  if (!loadingEdit) {
                    setShowEditForm(false);
                    setEventToEdit(null);
                    setEditEventId(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-500"
                disabled={loadingEdit}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingEdit && (
                <div className="flex justify-center items-center p-12">
                  <Loader className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading event data...</span>
                </div>
              )}
              {!loadingEdit && eventToEdit && (
                <EventForm 
                  mode="update" 
                  initialData={eventToEdit}
                  onClose={() => {
                    setShowEditForm(false);
                    setEventToEdit(null);
                    setEditEventId(null);
                  }}
                />
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}; 