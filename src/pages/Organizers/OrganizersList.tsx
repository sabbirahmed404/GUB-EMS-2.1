import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Mail, Calendar, Users } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';
import { UserDrawer } from './UserDrawer';

type Organizer = {
  user_id: string;
  full_name: string;
  email: string;
  role_in_institute?: string;
  description?: string;
  club?: string;
  club_position?: string;
  eventCount: number;
};

export default function OrganizersList() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      
      // First, fetch users with 'organizer' role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'organizer');
      
      if (userError) throw userError;
      
      // Now for each organizer, count their events
      const organizersWithCounts = await Promise.all(
        userData.map(async (user) => {
          const { count, error: countError } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.user_id);
          
          if (countError) throw countError;
          
          return {
            ...user,
            eventCount: count || 0
          };
        })
      );
      
      setOrganizers(organizersWithCounts);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizerClick = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    setDrawerOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Event Organizers</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((organizer) => (
            <Card 
              key={organizer.user_id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleOrganizerClick(organizer)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{organizer.full_name}</CardTitle>
                <CardDescription>
                  {organizer.club_position ? `${organizer.club_position}` : 'Event Organizer'}
                  {organizer.club ? ` at ${organizer.club}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{organizer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{organizer.eventCount} {organizer.eventCount === 1 ? 'Event' : 'Events'}</span>
                  </div>
                  {organizer.role_in_institute && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{organizer.role_in_institute}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedOrganizer && (
        <UserDrawer 
          organizer={selectedOrganizer} 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
        />
      )}
    </div>
  );
} 