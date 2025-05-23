import AllEventTable from '../../components/events/AllEventTable';
import { Button } from '../../components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AllEvents() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Check if user can create events (must be organizer or admin)
  const canCreateEvents = profile?.role === 'organizer' || profile?.role === 'admin';
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Events</h1>
        {canCreateEvents && (
          <Button 
            onClick={() => navigate('/dashboard/events/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Create Event
          </Button>
        )}
      </div>
      <AllEventTable />
    </div>
  );
} 