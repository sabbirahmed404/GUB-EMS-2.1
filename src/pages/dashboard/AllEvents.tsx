import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import EventDashboard from '../../pages/Events/EventDashboard';

export default function AllEvents() {
  return (
    <DashboardLayout>
      <EventDashboard />
    </DashboardLayout>
  );
} 