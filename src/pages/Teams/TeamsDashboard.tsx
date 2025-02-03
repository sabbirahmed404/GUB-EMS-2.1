import { Users } from 'lucide-react';

export default function TeamsDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="hero-container relative h-[40vh] flex items-center justify-center overflow-hidden rounded-b-[2.5rem] mx-4 md:mx-8">
        <div className="animated-pattern" />
        <div className="relative z-10 text-center text-white px-4">
          <Users className="w-20 h-20 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl font-bold mb-4">Teams Feature</h1>
          <p className="text-xl opacity-90">Coming Soon!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-8 text-primary">What to Expect</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3 text-gray-800">Team Creation</h3>
              <p className="text-gray-600">Create and manage teams for your events with ease</p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3 text-gray-800">Collaboration</h3>
              <p className="text-gray-600">Work together efficiently with team members</p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3 text-gray-800">Task Management</h3>
              <p className="text-gray-600">Assign and track tasks within your team</p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
            <p className="text-gray-700 mb-2">We're working hard to bring you the best team management experience.</p>
            <p className="text-gray-500">Stay tuned for updates!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 