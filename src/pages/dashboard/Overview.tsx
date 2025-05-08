import { useAuth } from '../../contexts/AuthContext';
import UserEventTable from '../../components/events/UserEventTable';
import { DashboardAnalytics } from '../../components/dashboard/DashboardAnalytics';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { EventSummary } from '../../components/dashboard/EventSummary';

export default function Overview() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Overview</h2>
        <DashboardAnalytics />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 pt-4">
        <div className="md:col-span-1">
          <h3 className="text-xl font-semibold mb-4">Next Event</h3>
          <EventSummary />
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">My Events</h3>
          <UserEventTable />
        </div>
      </div>
    </div>
  );
}