import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

type NextEvent = {
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  venue: string;
  is_upcoming: boolean;
};

export function EventSummary() {
  const { profile } = useAuth();
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.user_id) return;

    const fetchNextEvent = async () => {
      try {
        setLoading(true);
        const now = new Date().toISOString();

        // Get next upcoming event
        const { data: upcomingEvent, error: upcomingError } = await supabase
          .from('events')
          .select('event_id, event_name, start_date, end_date, venue')
          .eq('created_by', profile.user_id)
          .gt('start_date', now)
          .order('start_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        // Get current running event if no upcoming events
        if (!upcomingEvent && !upcomingError) {
          const { data: runningEvent, error: runningError } = await supabase
            .from('events')
            .select('event_id, event_name, start_date, end_date, venue')
            .eq('created_by', profile.user_id)
            .lte('start_date', now)
            .gte('end_date', now)
            .order('end_date', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (runningEvent && !runningError) {
            setNextEvent({
              ...runningEvent,
              is_upcoming: false
            });
          }
        } else if (upcomingEvent) {
          setNextEvent({
            ...upcomingEvent,
            is_upcoming: true
          });
        }
      } catch (error) {
        console.error('Error fetching next event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, [profile?.user_id]);

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!nextEvent) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No upcoming or current events</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <div className={`h-2 ${nextEvent.is_upcoming ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{nextEvent.event_name}</h3>
        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{nextEvent.venue}</p>
        
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(nextEvent.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatTime(nextEvent.start_date)} - {formatTime(nextEvent.end_date)}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            nextEvent.is_upcoming 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-blue-50 text-blue-600'
          }`}>
            {nextEvent.is_upcoming ? 'Upcoming Event' : 'Currently Running'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 