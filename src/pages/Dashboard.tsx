import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <DashboardLayout />
  );
}