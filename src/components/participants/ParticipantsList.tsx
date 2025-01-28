import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCache } from '../../contexts/CacheContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Participant {
  participant_id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  address: string;
  batch?: string;
  student_id?: string;
  gender: string;
  department: string;
  status: string;
  created_at: string;
  event_id: string;
}

export default function ParticipantsList() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();
  const { getData, setData } = useCache();

  useEffect(() => {
    async function fetchParticipants() {
      if (!profile?.user_id) return;

      try {
        const cacheKey = `participants_${profile.user_id}`;
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
            address,
            batch,
            student_id,
            gender,
            department,
            status,
            created_at,
            event_id
          `)
          .eq('user_id', profile.user_id);

        if (error) {
          console.error('Error fetching participants:', error);
          throw error;
        }
        
        if (data) {
          console.log('Received participants data:', data.length, 'records');
          setParticipants(data);
          // Cache for 5 minutes
          setData(cacheKey, data, 5 * 60 * 1000);
        }
      } catch (err) {
        console.error('Error in fetchParticipants:', err);
        setError('Failed to load participants');
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [profile?.user_id, getData, setData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.map((participant) => (
              <tr key={participant.participant_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {participant.gender.charAt(0).toUpperCase() + participant.gender.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.designation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.student_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div>{participant.email}</div>
                    <div>{participant.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {participant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 