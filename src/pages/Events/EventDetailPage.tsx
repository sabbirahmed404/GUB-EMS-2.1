import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { Calendar, Clock, MapPin, Users, Phone, Mail, Link, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PublicEventRegistration } from '../../components/events/PublicEventRegistration';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

// Types for event data
interface Event {
  event_id: string;
  eid: string;
  event_name: string;
  organizer_name: string;
  organizer_code: string;
  team_id: string | null;
  created_by: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  description: string | null;
  banner_url: string | null;
  contact_phone: string;
  contact_email: string;
}

interface EventDetail {
  event_id: string;
  social_media_links: Record<string, string> | null;
  chief_guests: string[] | null;
  special_guests: string[] | null;
  speakers: string[] | null;
  session_chair: string | null;
  sponsors: Record<string, any> | null;
}

type EventRouteParams = {
  eid: string;
};

export default function EventDetailPage() {
  const { eid } = useParams<EventRouteParams>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eid) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch base event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('eid', eid)
          .single();

        if (eventError) {
          throw new Error('Event not found');
        }

        setEvent(eventData);

        // Fetch extended event details if available
        const { data: detailsData, error: detailsError } = await supabase
          .from('event_details')
          .select('*')
          .eq('event_id', eventData.event_id)
          .maybeSingle();

        if (detailsError && detailsError.code !== 'PGRST116') {
          console.error('Error fetching event details:', detailsError);
        } else if (detailsData) {
          setEventDetails(detailsData);
        }

      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eid]);

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBA';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Event Not Found</h2>
            <p className="text-red-600 mb-6">{error || "We couldn't find the event you're looking for."}</p>
            <Button 
              onClick={() => navigate('/events')}
              className="px-6 py-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Registration Dialog */}
      <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
          </DialogHeader>
          {event && (
            <PublicEventRegistration 
              eventId={event.event_id} 
              eventName={event.event_name}
              onSuccess={() => {
                // Close the dialog after successful registration
                setTimeout(() => setShowRegistrationForm(false), 3000);
              }}
              onCancel={() => setShowRegistrationForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-5xl mx-auto px-4">
                      {/* Add bottom padding */}
                      <div className="pb-[55px]"></div>
        <Button 
          onClick={() => navigate('/events')}
          variant="ghost" 
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Banner */}
        <div 
          className="w-full h-64 md:h-80 rounded-xl mb-8 bg-center bg-cover relative"
          style={{ 
            backgroundImage: event.banner_url ? `url(${event.banner_url})` : undefined,
            backgroundColor: !event.banner_url ? colors.quaternary : undefined
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-end">
            <div className="p-6 md:p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.event_name}</h1>
              <p className="text-lg opacity-90">Organized by {event.organizer_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>About This Event</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {event.description || "No description provided for this event."}
              </p>
            </div>

            {/* Guest Information */}
            {eventDetails && (eventDetails.chief_guests?.length || eventDetails.special_guests?.length || eventDetails.speakers?.length || eventDetails.session_chair) && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>Guest Information</h2>
                
                {eventDetails.chief_guests && eventDetails.chief_guests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Chief Guest(s)</h3>
                    <ul className="list-disc pl-5">
                      {eventDetails.chief_guests.map((guest, index) => (
                        <li key={index} className="text-gray-700 mb-1">{guest}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eventDetails.special_guests && eventDetails.special_guests.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Special Guest(s)</h3>
                    <ul className="list-disc pl-5">
                      {eventDetails.special_guests.map((guest, index) => (
                        <li key={index} className="text-gray-700 mb-1">{guest}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eventDetails.speakers && eventDetails.speakers.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Speaker(s)</h3>
                    <ul className="list-disc pl-5">
                      {eventDetails.speakers.map((speaker, index) => (
                        <li key={index} className="text-gray-700 mb-1">{speaker}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eventDetails.session_chair && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Session Chair</h3>
                    <p className="text-gray-700">{eventDetails.session_chair}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sponsors */}
            {eventDetails?.sponsors && Object.keys(eventDetails.sponsors).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>Sponsors</h2>
                
                {Object.entries(eventDetails.sponsors).map(([category, sponsors]) => (
                  <div key={category} className="mb-4">
                    <h3 className="font-semibold text-lg mb-2 capitalize">{category} Sponsors</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(sponsors) ? 
                        sponsors.map((sponsor, index) => (
                          <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                            {sponsor}
                          </div>
                        )) : 
                        <p className="text-gray-700">{JSON.stringify(sponsors)}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 sticky top-8">
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Date</h3>
                    <p className="text-gray-600">
                      {formatDate(event.start_date)}
                      {event.start_date !== event.end_date && ` to ${formatDate(event.end_date)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Time</h3>
                    <p className="text-gray-600">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Venue</h3>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Organizer</h3>
                    <p className="text-gray-600">{event.organizer_name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Contact Phone</h3>
                    <p className="text-gray-600">{event.contact_phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-700">Contact Email</h3>
                    <p className="text-gray-600">{event.contact_email}</p>
                  </div>
                </div>

                {/* Social Media Links */}
                {eventDetails?.social_media_links && Object.keys(eventDetails.social_media_links).length > 0 && (
                  <div className="flex items-start">
                    <Link className="w-5 h-5 text-gray-500 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-700">Social Media</h3>
                      <div className="space-y-1 mt-1">
                        {Object.entries(eventDetails.social_media_links).map(([platform, url]) => (
                          <a 
                            key={platform} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block text-blue-600 hover:underline"
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Button 
                  className="w-full rounded-full py-6"
                  style={{ backgroundColor: colors.tertiary }}
                  onClick={() => setShowRegistrationForm(true)}
                >
                  Register Now
                </Button>

                <div className="mt-4 flex justify-center">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 