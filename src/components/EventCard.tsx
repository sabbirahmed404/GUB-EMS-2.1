import { Calendar, MapPin, Tag } from 'lucide-react';
import { Event } from '../types/event';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl h-full flex flex-col">
      <img 
        src={event.imageUrl} 
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-primary">{event.title}</h3>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Tag className="h-4 w-4 mr-2" />
              <span>${event.price}</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600">{event.description}</p>
        </div>
        <button className="w-full bg-primary hover:bg-accent text-white py-2 px-4 rounded-full transition-colors duration-300 mt-6">
          Register Now
        </button>
      </div>
    </div>
  );
}