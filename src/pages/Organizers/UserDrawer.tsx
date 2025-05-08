import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { X, Mail, Phone, Calendar, ClipboardList, Building, UserCircle, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

type Event = {
  event_id: string;
  eid: string;
  event_name: string;
  start_date: string;
  end_date: string;
  venue: string;
};

type Organizer = {
  user_id: string;
  full_name: string;
  email: string;
  role_in_institute?: string;
  description?: string;
  club?: string;
  club_position?: string;
  phone?: string;
  eventCount: number;
};

interface UserDrawerProps {
  organizer: Organizer;
  open: boolean;
  onClose: () => void;
}

export const UserDrawer = ({ organizer, open, onClose }: UserDrawerProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && organizer) {
      fetchOrganizerEvents();
    }
  }, [open, organizer]);

  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('event_id, eid, event_name, start_date, end_date, venue')
        .eq('created_by', organizer.user_id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eid: string) => {
    navigate(`/events/${eid}`);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Organizer Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-1">{organizer.full_name}</h3>
                {organizer.club_position && organizer.club && (
                  <p className="text-gray-600 mb-4">{organizer.club_position} at {organizer.club}</p>
                )}
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <span>{organizer.email}</span>
                  </div>
                  
                  {organizer.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{organizer.phone}</span>
                    </div>
                  )}
                  
                  {organizer.role_in_institute && (
                    <div className="flex items-center">
                      <UserCircle className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{organizer.role_in_institute}</span>
                    </div>
                  )}
                  
                  {organizer.club && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-500 mr-3" />
                      <span>{organizer.club}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {organizer.description && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-2">About</h4>
                  <p className="text-gray-700">{organizer.description}</p>
                </div>
              )}
              
              <div>
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <h4 className="text-lg font-semibold">Events ({events.length})</h4>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div 
                        key={event.event_id}
                        onClick={() => handleEventClick(event.eid)}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <h5 className="font-semibold mb-2">{event.event_name}</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              {new Date(event.start_date).toLocaleDateString()} 
                              {event.end_date !== event.start_date && 
                                ` - ${new Date(event.end_date).toLocaleDateString()}`}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No events found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 