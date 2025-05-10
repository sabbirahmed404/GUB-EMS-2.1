import { useEffect, useState } from 'react';
import { Sidebar } from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import { MobileNav } from '../MobileNav';
import { Dialog } from '@headlessui/react';
import { EventForm } from '../events/EventForm';
import { ProfileButton } from '../profile/ProfileButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
    
    // Detect if running as PWA
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsPWA(isPWAMode);
    
    // Set viewport height for mobile browsers
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update safe area inset bottom for PWA mode
      const safeAreaInsetBottom = isPWAMode ? 
        'env(safe-area-inset-bottom)' : '0px';
      document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaInsetBottom);
      
      // Force refresh layout on rotation
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);
    
    // Extra iOS fixes for home indicator area on rotation
    if (isIOSDevice && isPWAMode) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          document.body.style.display = 'none';
          setTimeout(() => {
            document.body.style.display = 'block';
          }, 5);
        }, 300);
      });
    }
    
    // Force update after a short delay to ensure proper calculation after PWA launch
    setTimeout(setVhProperty, 100);
    
    // Force fix for iPhone XR bottom area
    if (isIOSDevice && window.innerWidth === 414 && window.innerHeight === 896) {
      document.documentElement.style.setProperty('--ios-bottom-fix', '35px');
    }
    
    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

  const handleCreateEvent = () => {
    setShowEventForm(true);
  };

  if (!user || !profile) {
    return <LoadingSpinner />;
  }

  // Get current time for greeting
  const currentHour = new Date().getHours();
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  const mainContentClass = `flex-1 overflow-y-auto pb-safe ${isIOS && isPWA ? 'pb-[100px]' : ''}`;

  return (
    <div className="flex flex-col mobile-full-height bg-blue-800 bg-dot-pattern text-white md:flex-row">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 md:pl-64 ${isIOS ? 'h-[-webkit-fill-available]' : 'h-screen'}`}>
        {/* Header with greeting and profile button */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting}, {profile.full_name}</h1>
            <p className="text-blue-100 mt-1 opacity-80">Welcome to your Dashboard</p>
          </div>
          <div className="flex-shrink-0">
            <ProfileButton />
          </div>
        </div>
        
        {/* Main content scrollable area */}
        <main className={mainContentClass}>
          <div className="py-4 px-4">
            <div className="bg-blue-50 text-blue-800 rounded-lg shadow-lg blue-shadow-lg dashboard-accent-top overflow-hidden">
              <div className="md:p-6 p-4 overflow-x-hidden">
                {children}
              </div>
            </div>
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
              <div className="flex justify-between items-center p-4 border-b bg-blue-800 text-white">
                <Dialog.Title className="text-lg font-medium">
                  Create New Event
                </Dialog.Title>
                <button 
                  onClick={() => setShowEventForm(false)}
                  className="text-white hover:text-blue-100"
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