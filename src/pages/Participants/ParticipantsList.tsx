import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useCache } from '../../contexts/CacheContext';

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
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        setError('Failed to fetch events');
      }
    };

    fetchUserEvents();
  }, [profile?.user_id, getData, setData, selectedEvent]);

  // Fetch participants for selected event
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedEvent) return;
      
      try {
        setLoading(true);
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
          .select(`
            participant_id,
            name,
            designation,
            phone,
            email,
            student_id,
            status,
            created_at,
            event_id
          `)
          .eq('event_id', selectedEvent)
          .order('created_at', { ascending: false });

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

    fetchParticipants();
  }, [selectedEvent, getData, setData]);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Event Participants</h1>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Event Selection */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Event</option>
              {events.map((event) => (
                <option key={event.event_id} value={event.event_id}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>

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
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
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
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No participants found
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