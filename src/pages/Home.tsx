import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { events } from '../data/events';
import EventCard from '../components/EventCard';
import HeroSection from '../components/HeroSection';

export default function Home() {
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* Featured Events */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-primary">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <div className="text-center mt-12">
                    <Link
            to="/events"
            className="inline-flex items-center bg-primary hover:bg-accent text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300"
          >
            View All Events
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}