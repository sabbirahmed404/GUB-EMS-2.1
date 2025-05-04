import { useEffect, useState } from 'react';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { RoleSwitch } from '../auth/RoleSwitch';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { MobileNav } from '../MobileNav';
import { Dialog } from '@headlessui/react';
import { EventForm } from '../events/EventForm';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);
  
  useEffect(() => {
    // Set viewport height for mobile browsers
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    
    return () => {
      window.removeEventListener('resize', setVhProperty);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateEvent = () => {
    setShowEventForm(true);
  };

  if (!user || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col mobile-full-height bg-gray-100 md:flex-row">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64 h-[calc(100vh-4rem)] md:h-screen">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {/* Mobile menu button removed */}
            </div>

            {/* Right side header content */}
            <div className="ml-4 flex items-center md:ml-6">
              <RoleSwitch />
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Main content scrollable area */}
        <main className="flex-1 overflow-y-auto pb-[74px] md:pb-0 pb-safe">
          <div className="py-6 px-4">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav onCreateEvent={handleCreateEvent} />

        {/* Event Form Dialog */}
        <Dialog
          open={showEventForm}
          onClose={() => setShowEventForm(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden mobile-dialog flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <Dialog.Title className="text-lg font-medium">
                  Create New Event
                </Dialog.Title>
                <button 
                  onClick={() => setShowEventForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <EventForm 
                  mode="create" 
                  initialData={null}
                  onClose={() => setShowEventForm(false)}
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
} 