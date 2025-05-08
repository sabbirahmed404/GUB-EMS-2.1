import { useAuth } from '../../contexts/AuthContext';
import UserEventTable from '../../components/events/UserEventTable';
import { Button } from '../../components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardAnalytics } from '../../components/dashboard/DashboardAnalytics';

export default function MyEvents() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Check if user can create events (must be organizer or admin)
  const canCreateEvents = profile?.role === 'organizer' || profile?.role === 'admin';

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6">
      {canCreateEvents && (
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Events</h1>
          <Button 
            onClick={() => navigate('/dashboard/events/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Create Event
          </Button>
        </div>
      )}
      
      <div className="mb-6">
        <DashboardAnalytics />
      </div>
      
      <div>
        <UserEventTable />
      </div>
    </div>
  );
} 