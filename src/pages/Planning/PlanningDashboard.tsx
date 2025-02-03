import { Plane, Calendar, ClipboardList, Users } from 'lucide-react';

export default function PlanningDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="hero-container relative h-[40vh] flex items-center justify-center overflow-hidden rounded-b-[2.5rem] mx-4 md:mx-8">
        <div className="animated-pattern" />
        <div className="relative z-10 text-center text-white px-4">
          <Plane className="w-20 h-20 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold mb-4">Planning Feature</h1>
          <p className="text-xl opacity-90">In Planning Phase!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-8 text-center text-primary">
            Future Planning Features
          </h2>

          <div className="space-y-6 md:space-y-8">
            {/* Timeline-like feature preview */}
            <div className="flex flex-col md:flex-row items-start gap-4 md:space-x-6 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Event Timeline Planning</h3>
                <p className="text-gray-600">
                  Visual timeline for planning your event schedule, milestones, and deadlines
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-4 md:space-x-6 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Resource Management</h3>
                <p className="text-gray-600">
                  Efficiently manage and allocate resources, track budgets, and monitor expenses
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-4 md:space-x-6 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Team Coordination</h3>
                <p className="text-gray-600">
                  Coordinate with team members, assign responsibilities, and track progress
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
            <p className="text-gray-700 mb-2">
              We're designing a comprehensive planning system to make your event organization seamless.
            </p>
            <p className="text-gray-500">
              Your feedback is valuable! Stay tuned for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 