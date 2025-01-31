import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useCache } from '../../contexts/CacheContext';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  event_id: string;
  event_name: string;
  organizer_name: string;
}

interface Participant {
  participant_id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  student_id: string | null;
  status: string;
  created_at: string;
  event_id: string;
}

export default function ParticipantsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { getData, setData } = useCache();
  const navigate = useNavigate();

  const fetchParticipants = async () => {
    if (!selectedEvent) {
      setParticipants([]);
      return;
    }

    setLoading(true);
    try {
      const cacheKey = `event_participants_${selectedEvent}`;
      const cachedData = getData(cacheKey);

      if (cachedData) {
        console.log('Using cached participants data');
        setParticipants(cachedData);
        setLoading(false);
        return;
      }

      console.log('Fetching fresh participants data');
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', selectedEvent);

      if (error) throw error;

      if (data) {
        setParticipants(data);
        setData(cacheKey, data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setError('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events created by the user
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!profile?.user_id) return;
      
      try {
        const cacheKey = `organizer_events_${profile.user_id}`;
        const cachedData = getData(cacheKey);
        
        if (cachedData) {
          console.log('Using cached organizer events data');
          setEvents(cachedData);
          if (cachedData.length > 0 && !selectedEvent) {
            setSelectedEvent(cachedData[0].event_id);
          }
          setLoading(false);
          return;
        }

        console.log('Fetching fresh organizer events data');
        const { data, error } = await supabase
          .from('events')
          .select('event_id, event_name, organizer_name')
          .eq('created_by', profile.user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setEvents(data);
          setData(cacheKey, data);
          if (data.length > 0 && !selectedEvent) {
            setSelectedEvent(data[0].event_id);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [profile?.user_id, getData, setData, selectedEvent]);

  // Fetch participants for selected event
  useEffect(() => {
    fetchParticipants();
  }, [selectedEvent]);

  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (participant.student_id && participant.student_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDesignation = !designationFilter || participant.designation === designationFilter;

    return matchesSearch && matchesDesignation;
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  // Handle no events case
  if (events.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Event Participants</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
          <button
            onClick={() => navigate('/dashboard/events/create')}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create Your First Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Event Participants</h1>
          <button
            onClick={() => {
              if (selectedEvent) {
                const cacheKey = `event_participants_${selectedEvent}`;
                setData(cacheKey, null); // Clear cache
                fetchParticipants(); // Re-fetch data
              }
            }}
            className="flex items-center px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Event selector */}
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary mb-4"
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.event_id} value={event.event_id}>
              {event.event_name}
            </option>
          ))}
        </select>

        {/* Search and filter controls */}
        <div className="flex flex-wrap gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Designation Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Designations</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!selectedEvent ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Please select an event to view its participants
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery || designationFilter ? (
                      'No participants match your search criteria'
                    ) : (
                      'No participants have registered for this event yet'
                    )}
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.participant_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {participant.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.student_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.email}</div>
                      <div className="text-sm text-gray-500">{participant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 