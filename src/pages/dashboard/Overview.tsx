import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';

export default function Overview() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {profile.role === 'organizer' ? 'Upcoming Events' : 'Recommended Events'}
          </h2>
          <div className="space-y-4">
            {profile.role === 'organizer' ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">• AI Workshop (Next Week)</p>
                <p className="text-sm text-gray-600">• Spring Hackathon (In 2 weeks)</p>
                <p className="text-sm text-gray-600">• Tech Meetup (Next Month)</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">• Mobile App Development Workshop</p>
                <p className="text-sm text-gray-600">• Data Science Fundamentals</p>
                <p className="text-sm text-gray-600">• UI/UX Design Basics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}