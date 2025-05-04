import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Define venue structure
interface SubVenue {
  id: string;
  name: string;
}

interface MainVenue {
  id: string;
  name: string;
  subVenues?: SubVenue[];
}

interface VenueSelectProps {
  value: string;
  onChange: (venue: string) => void;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  currentEventId?: string;
}

export const VENUES: MainVenue[] = [
  { id: 'multipurpose', name: 'Multipurpose hall' },
  { id: 'seminar-a302', name: 'Seminar Hall A302' },
  { id: 'syndicate-a401', name: 'Syndicate Room A401' },
  { id: 'canteen', name: 'GUB Canteen' },
  { id: 'field', name: 'GUB Field' },
  { id: 'annex', name: 'Annex Building' },
  { id: 'library', name: 'Library' },
  {
    id: 'l-building',
    name: 'L Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `L${i + 101}`,
      name: `L${i + 101}`
    }))
  },
  {
    id: 'k-building',
    name: 'K Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `K${i + 101}`,
      name: `K${i + 101}`
    }))
  },
  {
    id: 'e-building',
    name: 'E Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `E${i + 101}`,
      name: `E${i + 101}`
    }))
  },
  {
    id: 'f-building',
    name: 'F Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `F${i + 101}`,
      name: `F${i + 101}`
    }))
  },
  {
    id: 'g-building',
    name: 'G Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `G${i + 101}`,
      name: `G${i + 101}`
    }))
  },
  {
    id: 'h-building',
    name: 'H Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `H${i + 101}`,
      name: `H${i + 101}`
    }))
  },
  {
    id: 'j-building',
    name: 'J Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `J${i + 101}`,
      name: `J${i + 101}`
    }))
  },
  {
    id: 'i-building',
    name: 'I Building',
    subVenues: Array.from({ length: 11 }, (_, i) => ({
      id: `I${i + 101}`,
      name: `I${i + 101}`
    }))
  },
  {
    id: 'admin-building',
    name: 'Admin Building',
    subVenues: [
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `A${i + 101}`,
        name: `A${i + 101}`
      })),
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `A${i + 201}`,
        name: `A${i + 201}`
      })),
      ...Array.from({ length: 9 }, (_, i) => {
        // Skip A302 as it's already a main venue
        if (i + 301 === 302) return null;
        return {
          id: `A${i + 301}`,
          name: `A${i + 301}`
        };
      }).filter(Boolean),
      // Skip A401 as it's the Syndicate Room already listed as a main venue
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `A${i + 402}`,
        name: `A${i + 402}`
      })),
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `A${i + 501}`,
        name: `A${i + 501}`
      })),
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `A${i + 601}`,
        name: `A${i + 601}`
      }))
    ] as SubVenue[]
  }
];

export function VenueSelect({ value, onChange, startDate, startTime, endDate, endTime, currentEventId }: VenueSelectProps) {
  const [selectedMain, setSelectedMain] = useState<string>('');
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [occupiedVenues, setOccupiedVenues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Find if the current value matches any venue
  useEffect(() => {
    if (value) {
      // Check if it's a main venue without sub-venues
      const mainVenue = VENUES.find(v => v.name === value);
      if (mainVenue && !mainVenue.subVenues) {
        setSelectedMain(mainVenue.id);
        setSelectedSub('');
        return;
      }

      // Check if it's a sub-venue
      for (const main of VENUES) {
        if (main.subVenues) {
          const sub = main.subVenues.find(s => s.name === value);
          if (sub) {
            setSelectedMain(main.id);
            setSelectedSub(sub.id);
            return;
          }
        }
      }

      // If not found in our structure, just clear selections
      setSelectedMain('');
      setSelectedSub('');
    }
  }, [value]);

  // Check venue availability when dates/times change
  useEffect(() => {
    const checkVenueAvailability = async () => {
      if (!startDate || !endDate || !startTime || !endTime) {
        return;
      }

      setIsLoading(true);
      
      try {
        // Query events that overlap with the selected time period
        const { data, error } = await supabase
          .from('events')
          .select('event_id, venue, start_date, end_date, start_time, end_time');

        if (error) {
          console.error('Error checking venue availability:', error);
          return;
        }

        // Filter out current event if editing
        const filteredEvents = currentEventId 
          ? (data || []).filter(event => event.event_id !== currentEventId)
          : (data || []);

        // Process events to check for time and date overlap
        const occupied = [];
        
        for (const event of filteredEvents) {
          // Check date overlap first
          const eventStartDate = new Date(event.start_date);
          const eventEndDate = new Date(event.end_date);
          const formStartDate = new Date(startDate);
          const formEndDate = new Date(endDate);
          
          // Skip if dates don't overlap
          const datesOverlap = !(
            eventEndDate < formStartDate || 
            eventStartDate > formEndDate
          );
          
          if (!datesOverlap) continue;
          
          // If dates overlap, then check time overlap
          const convertToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const eventStart = convertToMinutes(event.start_time);
          const eventEnd = convertToMinutes(event.end_time);
          const formStart = convertToMinutes(startTime);
          const formEnd = convertToMinutes(endTime);
          
          // Check if times overlap
          const timesOverlap = !(
            eventEnd <= formStart || 
            eventStart >= formEnd
          );
          
          if (timesOverlap) {
            occupied.push(event.venue);
            console.log(`Venue ${event.venue} is occupied:`, { 
              event: `${event.start_date} ${event.start_time}-${event.end_time}`, 
              form: `${startDate} ${startTime}-${endTime}` 
            });
          }
        }
        
        setOccupiedVenues(occupied);
      } catch (err) {
        console.error('Error in venue availability check:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkVenueAvailability();
  }, [startDate, endDate, startTime, endTime, currentEventId]);

  // Handle main venue selection
  const handleMainVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mainId = e.target.value;
    setSelectedMain(mainId);
    setSelectedSub('');

    // If this is a venue without sub-venues, update the form value
    const venue = VENUES.find(v => v.id === mainId);
    if (venue && !venue.subVenues) {
      onChange(venue.name);
    }
  };

  // Handle sub-venue selection
  const handleSubVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = e.target.value;
    setSelectedSub(subId);

    // Find the venue information to update the form value
    const mainVenue = VENUES.find(v => v.id === selectedMain);
    if (mainVenue && mainVenue.subVenues) {
      const subVenue = mainVenue.subVenues.find(s => s.id === subId);
      if (subVenue) {
        onChange(subVenue.name);
      }
    }
  };

  // Check if a venue is occupied
  const isVenueOccupied = (venueName: string) => {
    const isOccupied = occupiedVenues.includes(venueName);
    
    // Add additional debugging
    if (isOccupied) {
      console.log(`Venue ${venueName} is marked as occupied`);
    }
    
    return isOccupied;
  };

  // Get the selected main venue object
  const selectedMainVenue = VENUES.find(v => v.id === selectedMain);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="main-venue" className="block text-sm font-medium text-gray-700">
          Main Venue *
        </label>
        <select
          id="main-venue"
          value={selectedMain}
          onChange={handleMainVenueChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          disabled={isLoading}
        >
          <option value="">Select a venue</option>
          {VENUES.map((venue) => (
            <option 
              key={venue.id} 
              value={venue.id}
              disabled={!venue.subVenues && isVenueOccupied(venue.name)}
              className={!venue.subVenues && isVenueOccupied(venue.name) ? "text-red-500 font-bold" : ""}
            >
              {venue.name} {!venue.subVenues && isVenueOccupied(venue.name) ? ' (⚠️ OCCUPIED)' : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedMainVenue && selectedMainVenue.subVenues && (
        <div>
          <label htmlFor="sub-venue" className="block text-sm font-medium text-gray-700">
            Room Number *
          </label>
          <select
            id="sub-venue"
            value={selectedSub}
            onChange={handleSubVenueChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            disabled={isLoading}
          >
            <option value="">Select a room</option>
            {selectedMainVenue.subVenues.map((subVenue) => (
              <option 
                key={subVenue.id} 
                value={subVenue.id}
                disabled={isVenueOccupied(subVenue.name)}
                className={isVenueOccupied(subVenue.name) ? "text-red-500 font-bold" : ""}
              >
                {subVenue.name} {isVenueOccupied(subVenue.name) ? ' (⚠️ OCCUPIED)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading && (
        <div className="text-sm text-gray-500">
          Checking venue availability...
        </div>
      )}

      {occupiedVenues.length > 0 && (
        <div className="text-sm text-red-500 mt-2">
          Note: Some venues are already booked for this time slot
        </div>
      )}
    </div>
  );
} 