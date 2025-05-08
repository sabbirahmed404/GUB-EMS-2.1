import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CalendarClock, CalendarDays, CheckCircle, Users } from 'lucide-react';

type EventCount = {
  running: number;
  upcoming: number;
  participations: number;
  total: number;
};

export function DashboardAnalytics() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState<EventCount>({
    running: 0,
    upcoming: 0,
    participations: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchEventCounts = async () => {
      try {
        setLoading(true);
        const now = new Date().toISOString();

        // Get all events created by the user
        const { data: userEvents, error: userEventsError } = await supabase
          .from('events')
          .select('event_id, start_date, end_date')
          .eq('created_by', profile.user_id);

        if (userEventsError) throw userEventsError;

        // Calculate running and upcoming events
        const running = userEvents?.filter(event => 
          new Date(event.start_date) <= new Date(now) && 
          new Date(event.end_date) >= new Date(now)
        ).length || 0;

        const upcoming = userEvents?.filter(event => 
          new Date(event.start_date) > new Date(now)
        ).length || 0;

        // Try to get participations from team_members table if user is part of any teams/events
        let participationsCount = 0;
        try {
          const { data: teamMemberships, error: teamError } = await supabase
            .from('team_members')
            .select('*')
            .eq('user_id', profile.user_id);
          
          if (!teamError && teamMemberships) {
            participationsCount = teamMemberships.length;
          }
        } catch (err) {
          console.log('Could not fetch team memberships:', err);
        }

        // Set all the counts
        setCounts({
          running,
          upcoming,
          participations: participationsCount,
          total: userEvents?.length || 0
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Set counts with whatever data we have so far
        setCounts(prev => ({
          ...prev,
          running: 0,
          upcoming: 0,
          total: 0,
          participations: 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchEventCounts();
  }, [profile?.user_id]);

  const analyticsCards = [
    {
      title: 'Running Events',
      value: counts.running,
      description: 'Events currently in progress',
      icon: <CalendarClock className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Upcoming Events',
      value: counts.upcoming,
      description: 'Events scheduled in the future',
      icon: <CalendarDays className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100',
      textColor: 'text-emerald-600'
    },
    {
      title: 'My Participations',
      value: counts.participations,
      description: 'Events you are participating in',
      icon: <CheckCircle className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Events',
      value: counts.total,
      description: 'Total events created by you',
      icon: <Users className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {analyticsCards.map((card, index) => (
        <Card 
          key={index} 
          className={`${card.color} border shadow-sm transition-all hover:shadow-md`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className="rounded-full p-2 bg-white/80 shadow-sm">
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1 leading-none tracking-tight">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <span className={card.textColor}>{card.value}</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 