import { useState, useEffect } from 'react';
import { ArrowRight, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { colors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { Dialog } from '@headlessui/react';

// Event interface matching the Supabase events table
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

// Organizer interface
interface Organizer {
  user_id: string;
  full_name: string;
  club: string | null;
  club_position: string | null;
  eventCount: number;
  avatar_url?: string;
}

// Event images for slideshow
const eventImages = [
  '/Assets/event-image/noboborsho.jpg',
  '/Assets/event-image/carnival.jpg',
  '/Assets/event-image/carnival-2.jpg',
  '/Assets/event-image/carnival-3.jpg',
];

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Image slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % eventImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch events and organizers when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: true });
        
        if (eventsError) throw eventsError;
        
        const now = new Date();
        
        // Filter upcoming events - events that haven't started yet
        const upcoming = eventsData.filter(event => new Date(event.start_date) > now)
          .slice(0, 4);
        
        // Featured events - prioritize running events and upcoming events
        const runningEvents = eventsData.filter(event => {
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);
          return startDate <= now && endDate >= now;
        });
        
        // Get some upcoming events if we don't have enough running events
        let featuredEventsList = [...runningEvents];
        
        // If we have less than 3 running events, add some upcoming events
        if (featuredEventsList.length < 3) {
          const upcomingForFeatured = eventsData
            .filter(event => new Date(event.start_date) > now)
            .slice(0, 3 - featuredEventsList.length);
          
          featuredEventsList = [...featuredEventsList, ...upcomingForFeatured];
        }
        
        // If we still have less than 3 events, add some past events
        if (featuredEventsList.length < 3) {
          const pastEvents = eventsData
            .filter(event => new Date(event.end_date) < now)
            .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
            .slice(0, 3 - featuredEventsList.length);
          
          featuredEventsList = [...featuredEventsList, ...pastEvents];
        }
        
        setFeaturedEvents(featuredEventsList.slice(0, 3));
        setUpcomingEvents(upcoming);
        
        // Fetch event organizers
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('events')
          .select('created_by, organizer_name')
          .not('created_by', 'is', null);
        
        if (creatorsError) throw creatorsError;
        
        // Count events per organizer
        const organizerCounts = creatorsData.reduce((acc, event) => {
          if (event.created_by) {
            acc[event.created_by] = (acc[event.created_by] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);
        
        // Get top organizers
        const topOrganizerIds = Object.keys(organizerCounts)
          .sort((a, b) => organizerCounts[b] - organizerCounts[a])
          .slice(0, 4);
        
        if (topOrganizerIds.length > 0) {
          const { data: organizersData, error: organizersError } = await supabase
            .from('users')
            .select('user_id, full_name, club, club_position, avatar_url')
            .in('user_id', topOrganizerIds);
          
          if (organizersError) throw organizersError;
          
          // Add event count to each organizer
          const enrichedOrganizers = organizersData.map(org => ({
            ...org,
            eventCount: organizerCounts[org.user_id] || 0
          }));
          
          setOrganizers(enrichedOrganizers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleOpenEventModal = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleParticipate = async () => {
    if (!user) {
      // Store the event ID in localStorage to redirect after login
      if (selectedEvent) {
        localStorage.setItem('pendingEventParticipation', selectedEvent.event_id);
      }
      handleCloseEventModal();
      await signInWithGoogle();
    } else if (selectedEvent) {
      handleCloseEventModal();
      navigate(`/dashboard/events/${selectedEvent.event_id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white flex-grow">
      {/* Hero Section */}
      <section 
        className="relative pt-36 pb-28 overflow-hidden" 
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.tertiary} 100%)`,
        }}
      >
        {/* Gradient decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)` }} />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-5"
            style={{ background: `radial-gradient(circle, ${colors.light} 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, ${colors.highlight} 0%, transparent 70%)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column */}
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-6">
              GUB Event Management System
            </h1>
            <h2 className="text-2xl mb-4" style={{ color: colors.lighter }}>
              Transform Your Events into Unforgettable Experiences
            </h2>
            <p className="text-lg opacity-90 mb-8 text-justify" style={{ color: colors.lightest }}>
              Streamline your event planning process with our comprehensive management system. 
              From registration to analytics, we provide all the tools you need to create 
              successful events that leave lasting impressions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/events" 
                className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                style={{ 
                  backgroundColor: colors.accent,
                  color: colors.primary,
                  boxShadow: '0 4px 14px rgba(0, 180, 216, 0.4)'
                }}
              >
                Explore Events
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/auth/login" 
                className="px-6 py-3 rounded-lg font-medium border-2 transition-all duration-300 hover:bg-white/10"
                style={{ 
                  borderColor: colors.accent,
                  color: colors.lightest
                }}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column - Event Image Slideshow */}
          <div className="hidden md:block">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 relative h-[340px]">
              {eventImages.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Event Image ${index + 1}`} 
                  className={`absolute top-0 left-0 w-full h-full object-cover rounded-xl transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {eventImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 px-4" style={{ backgroundColor: colors.lightest }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
              Featured Events
            </h2>
            <Link 
              to="/events"
              className="px-4 py-2 rounded-lg flex items-center gap-1 transition-all hover:bg-white"
              style={{ color: colors.primary }}
            >
              <span>View More</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading placeholders
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg shadow-md h-96"></div>
              ))
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map(event => (
                <div 
                  key={event.event_id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleOpenEventModal(event)}
                >
                  <div 
                    className="h-48 bg-gray-200 relative" 
                    style={{ 
                      backgroundImage: event.banner_url ? `url(${event.banner_url})` : undefined,
                      backgroundColor: !event.banner_url ? colors.tertiary : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!event.banner_url && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold">
                        {event.event_name}
                      </div>
                    )}
                    
                    {/* Event status label */}
                    <div className="absolute top-3 right-3">
                      {(() => {
                        const now = new Date();
                        const startDate = new Date(event.start_date);
                        const endDate = new Date(event.end_date);
                        
                        let labelText = '';
                        let bgColor = '';
                        
                        if (startDate > now) {
                          labelText = 'Upcoming';
                          bgColor = colors.accent;
                        } else if (startDate <= now && endDate >= now) {
                          labelText = 'Running';
                          bgColor = colors.primary;
                        } else {
                          labelText = 'Ended';
                          bgColor = colors.tertiary;
                        }
                        
                        return (
                          <div 
                            className="px-3 py-1 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: bgColor }}
                          >
                            {labelText}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                      {event.event_name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center" style={{ color: colors.secondary }}>
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center" style={{ color: colors.secondary }}>
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                      </div>
                      <div className="flex items-center" style={{ color: colors.secondary }}>
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center" style={{ color: colors.secondary }}>
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.organizer_name}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 flex-1 line-clamp-2 text-sm">
                      {event.description || "No description available."}
                    </p>
                    <button 
                      className="w-full mt-4 py-2 px-4 rounded-full text-white font-medium transition-colors duration-300"
                      style={{ backgroundColor: colors.tertiary }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-lg text-gray-500">No featured events available at this time.</p>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
              Upcoming Events
            </h2>
            <Link 
              to="/events" 
              className="px-4 py-2 rounded-lg flex items-center gap-1 transition-all hover:bg-gray-100"
              style={{ color: colors.primary }}
            >
              <span>View More</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg shadow-md h-64"></div>
              ))
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div 
                  key={event.event_id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => handleOpenEventModal(event)}
                >
                  <div 
                    className="h-32 relative" 
                    style={{ 
                      backgroundImage: event.banner_url ? `url(${event.banner_url})` : undefined,
                      backgroundColor: !event.banner_url ? colors.quaternary : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute top-0 left-0 bg-white rounded-br-lg p-2" style={{ backgroundColor: colors.accent, color: 'white' }}>
                      <div className="text-sm font-bold">{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-xl font-bold">{new Date(event.start_date).getDate()}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1" style={{ color: colors.primary }}>
                      {event.event_name}
                    </h3>
                    <div className="flex items-center text-sm mb-1" style={{ color: colors.secondary }}>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm mb-2" style={{ color: colors.secondary }}>
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <button 
                      className="w-full mt-2 py-1.5 px-3 rounded-full text-white text-sm font-medium transition-colors duration-300"
                      style={{ backgroundColor: colors.tertiary }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-4 text-center text-lg text-gray-500">No upcoming events at this time.</p>
            )}
          </div>
        </div>
      </section>

      {/* Top Organizers */}
      <section className="py-16 px-4" style={{ backgroundColor: colors.lightest }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: colors.primary }}>
              Top Organizers
            </h2>
            <Link 
              to="/organizers" 
              className="px-4 py-2 rounded-lg flex items-center gap-1 transition-all hover:bg-white"
              style={{ color: colors.primary }}
            >
              <span>View More</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-lg shadow-md h-48"></div>
              ))
            ) : organizers.length > 0 ? (
              organizers.map(organizer => (
                <div 
                  key={organizer.user_id} 
                  className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl text-center"
                >
                  <div className="inline-block rounded-full p-1 mb-4" style={{ backgroundColor: colors.lighter }}>
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {organizer.avatar_url ? (
                        <img src={organizer.avatar_url} alt={organizer.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: colors.tertiary, color: 'white' }}>
                          {organizer.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.primary }}>{organizer.full_name}</h3>
                  <p className="text-sm mb-2" style={{ color: colors.tertiary }}>
                    {organizer.club_position ? `${organizer.club_position}` : ''}
                    {organizer.club && organizer.club_position ? ' at ' : ''}
                    {organizer.club ? organizer.club : 'Event Organizer'}
                  </p>
                  <div className="text-sm font-medium rounded-full py-1 px-3 inline-block" style={{ backgroundColor: colors.lightest, color: colors.secondary }}>
                    {organizer.eventCount} Event{organizer.eventCount !== 1 ? 's' : ''}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-4 text-center text-lg text-gray-500">No organizers data available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Event Detail Modal */}
      <Dialog 
        open={showEventModal} 
        onClose={handleCloseEventModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
            {selectedEvent && (
              <>
                <div 
                  className="h-48 bg-gray-200 relative" 
                  style={{ 
                    backgroundImage: selectedEvent.banner_url ? `url(${selectedEvent.banner_url})` : undefined,
                    backgroundColor: !selectedEvent.banner_url ? colors.tertiary : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div 
                    className="absolute inset-0 flex items-end"
                    style={{ 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
                    }}
                  >
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white">{selectedEvent.event_name}</h3>
                      <p className="text-white opacity-90">Organized by {selectedEvent.organizer_name}</p>
                    </div>
                  </div>
                  
                  {/* Event status label */}
                  <div className="absolute top-3 right-3">
                    {(() => {
                      const now = new Date();
                      const startDate = new Date(selectedEvent.start_date);
                      const endDate = new Date(selectedEvent.end_date);
                      
                      let labelText = '';
                      let bgColor = '';
                      
                      if (startDate > now) {
                        labelText = 'Upcoming';
                        bgColor = colors.accent;
                      } else if (startDate <= now && endDate >= now) {
                        labelText = 'Running';
                        bgColor = colors.primary;
                      } else {
                        labelText = 'Ended';
                        bgColor = colors.tertiary;
                      }
                      
                      return (
                        <div 
                          className="px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: bgColor }}
                        >
                          {labelText}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>Event Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center" style={{ color: colors.secondary }}>
                          <Calendar className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">Date</div>
                            <div>{formatDate(selectedEvent.start_date)} to {formatDate(selectedEvent.end_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center" style={{ color: colors.secondary }}>
                          <Clock className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">Time</div>
                            <div>{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</div>
                          </div>
                        </div>
                        <div className="flex items-center" style={{ color: colors.secondary }}>
                          <MapPin className="h-5 w-5 mr-3" />
                          <div>
                            <div className="font-medium">Venue</div>
                            <div>{selectedEvent.venue}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-3" style={{ color: colors.primary }}>Contact Information</h4>
                      <p className="mb-2">
                        <span className="font-medium">Email:</span> {selectedEvent.contact_email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {selectedEvent.contact_phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2" style={{ color: colors.primary }}>Description</h4>
                    <p className="text-gray-700">{selectedEvent.description || "No description available."}</p>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={handleCloseEventModal}
                      className="px-4 py-2 border rounded-lg font-medium"
                      style={{ borderColor: colors.tertiary, color: colors.tertiary }}
                    >
                      Close
                    </button>
                    <button 
                      onClick={handleParticipate}
                      className="px-6 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {user ? 'Register Now' : 'Sign In to Register'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}