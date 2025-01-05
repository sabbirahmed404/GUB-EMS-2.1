import { Calendar, Users, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">About GUB-EMS</h1>
          <p className="text-xl text-gray-600">
            Your trusted partner in event management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Curated Events</h3>
            <p className="text-gray-600">
              We carefully select the best events for our platform
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Built by event lovers, for event lovers
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Award className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
            <p className="text-gray-600">
              We guarantee the best event experience
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2024, GUB-EMS has been at the forefront of
            revolutionizing how people discover and attend events in University
            Campus. Our platform brings together event organizers and attendees
            in a seamless, user-friendly environment.
          </p>
          <p className="text-gray-600">
            We believe that great events have the power to bring people together
            and create lasting memories. That's why we're committed to making
            event discovery and ticket purchasing as simple as possible.
          </p>
        </div>
      </div>
    </div>
  );
}
