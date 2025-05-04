import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Users, 
  Star, 
  Tag, 
  Link as LinkIcon, 
  MessageSquare,
  Hash
} from 'lucide-react';

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

export interface EventDetailsProps {
  event_id: string;
  eid: string;
  event_name: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string;
  created_by?: string;
  organizer_name: string;
  organizer_code: string;
  contact_email?: string;
  contact_phone?: string;
  speakers?: string;
  chief_guests?: string;
  session_chair?: string;
  special_guests?: string;
  social_media_links?: SocialMediaLinks;
  status: string;
}

const EventDetails: React.FC<{ event: EventDetailsProps }> = ({ event }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{event.event_name}</h1>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Hash className="h-4 w-4" />
          <span>{event.eid}</span>
        </div>
        <div className="flex items-center">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
            event.status === 'running' || event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {event.status}
          </span>
        </div>
      </div>

      {event.description && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Event Details</h2>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-600">
                  {formatDate(event.start_date)}
                  {event.end_date && event.start_date !== event.end_date && (
                    <> to {formatDate(event.end_date)}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Venue</p>
                <p className="text-sm text-gray-600">{event.venue}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Organizer Information</h2>
            
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Organizer</p>
                <p className="text-sm text-gray-600">{event.organizer_name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Tag className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Organizer Code</p>
                <p className="text-sm text-gray-600 font-mono">{event.organizer_code}</p>
              </div>
            </div>

            {event.contact_email && (
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Contact Email</p>
                  <a href={`mailto:${event.contact_email}`} className="text-sm text-blue-600 hover:underline">
                    {event.contact_email}
                  </a>
                </div>
              </div>
            )}

            {event.contact_phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Contact Phone</p>
                  <a href={`tel:${event.contact_phone}`} className="text-sm text-blue-600 hover:underline">
                    {event.contact_phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {event.speakers && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Speakers</h2>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{event.speakers}</p>
              </div>
            </div>
          )}

          {event.chief_guests && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Chief Guests</h2>
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{event.chief_guests}</p>
              </div>
            </div>
          )}

          {event.session_chair && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Session Chair</h2>
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{event.session_chair}</p>
              </div>
            </div>
          )}

          {event.special_guests && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Special Guests</h2>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{event.special_guests}</p>
              </div>
            </div>
          )}

          {event.social_media_links && Object.values(event.social_media_links).some(link => link) && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">Social Media & Links</h2>
              {event.social_media_links.website && (
                <div className="flex items-start space-x-3">
                  <LinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Website</p>
                    <a href={event.social_media_links.website} target="_blank" rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.social_media_links.website}
                    </a>
                  </div>
                </div>
              )}
              {event.social_media_links.facebook && (
                <div className="flex items-start space-x-3">
                  <LinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Facebook</p>
                    <a href={event.social_media_links.facebook} target="_blank" rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {event.social_media_links.facebook}
                    </a>
                  </div>
                </div>
              )}
              {/* Add other social media links similarly */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 