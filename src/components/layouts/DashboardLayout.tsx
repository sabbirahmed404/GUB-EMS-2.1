import { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/test-auth');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64">
        <Sidebar />
      </div>
      <div className="fixed top-0 left-64 right-0">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold">Welcome, {profile?.full_name}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <span>Current Role: {profile?.role}</span>
                <button className="ml-2 text-blue-600 hover:text-blue-700">(Switch)</button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => navigate('/dashboard/events/create')}
              >
                Create Event
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
      </div>
      <div className="flex-1 ml-64 mt-16">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}; 