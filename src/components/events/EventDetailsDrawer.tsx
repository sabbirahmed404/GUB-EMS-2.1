import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import EventDetails, { EventDetailsProps } from './EventDetails';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EventDetailsDrawerProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailsDrawer: React.FC<EventDetailsDrawerProps> = ({ 
  eventId, 
  isOpen, 
  onClose 
}) => {
  const [event, setEvent] = useState<EventDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!isOpen || !eventId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('event_id', eventId)
          .single();
          
        if (error) throw error;
        
        setEvent(data as EventDetailsProps);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, isOpen]);

  return (
    <Drawer open={isOpen} onOpenChange={onClose} side="right" className="overflow-y-auto">
      <DrawerClose onClick={onClose} className="absolute right-4 top-4 z-10">
        <X className="h-5 w-5 text-gray-500" />
      </DrawerClose>
      
      <DrawerContent className="h-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Info className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">Error</h3>
            <p className="text-gray-500 mt-1">{error}</p>
          </div>
        ) : event ? (
          <EventDetails event={event} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Info className="h-10 w-10 text-gray-500 mb-2" />
            <h3 className="text-lg font-medium text-gray-900">No Data</h3>
            <p className="text-gray-500 mt-1">Event not found</p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default EventDetailsDrawer; 