import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Users, Calendar, TrendingUp } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Events', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Active Participants', value: '148', icon: Users, color: 'bg-green-500' },
    { label: 'Event Registrations', value: '1,234', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Upcoming Events', value: '5', icon: BarChart, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.user_metadata?.full_name || 'User'}!</h1>
          <p className="text-gray-600">Here's what's happening with your events today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Add recent activity items here */}
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {/* Add upcoming events here */}
            <p className="text-gray-600">No upcoming events</p>
          </div>
        </div>
      </div>
    </div>
  );
}