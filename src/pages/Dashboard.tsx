import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/layouts/DashboardLayout';

export default function Dashboard() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}