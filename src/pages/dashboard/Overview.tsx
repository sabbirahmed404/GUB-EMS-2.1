import { useAuth } from '../../contexts/AuthContext';
import UserEventTable from '../../components/events/UserEventTable';

export default function Overview() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>
        <UserEventTable />
      </div>
    </div>
  );
}