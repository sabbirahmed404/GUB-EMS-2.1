import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserPlus, Users, Plus, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavProps {
  onCreateEvent: () => void;
}

export const MobileNav = ({ onCreateEvent }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
    
    // Add iOS class to html for targeted CSS
    if (isIOSDevice) {
      document.documentElement.classList.add('ios');
    }
  }, []);

  // Base navigation items
  const baseNavItems = [
    {
      name: 'My Events',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['organizer', 'admin'] // Only visible to organizers and admins
    },
    {
      name: 'Events',
      path: '/dashboard/events',
      icon: Calendar,
      roles: ['visitor', 'organizer', 'admin'] // Visible to all roles
    },
    {
      name: 'Reg',
      path: '/dashboard/registrations',
      icon: UserPlus,
      roles: ['visitor', 'organizer', 'admin'] // Visible to all roles
    },
    {
      name: 'Participants',
      path: '/dashboard/participants',
      icon: Users,
      roles: ['organizer', 'admin'] // Only visible to organizers and admins
    },
    {
      name: 'Organizers',
      path: '/dashboard/organizers',
      icon: Briefcase,
      roles: ['admin'] // Only visible to admins
    }
  ];

  // Filter navigation items based on user role
  const navigationItems = baseNavItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

  // If user is a visitor, show Events first
  const itemsToShow = profile?.role === 'visitor' ? 
    navigationItems.filter(item => item.roles.includes('visitor')) : 
    navigationItems.slice(0, 4); // Show max 4 items for organizers/admins

  // Center action button should only be visible to organizers and admins
  const showActionButton = profile?.role === 'organizer' || profile?.role === 'admin';

  return (
    <div 
      className={`fixed bottom-0 left-0 z-50 w-full bg-blue-800 bg-dot-pattern border-t border-blue-700 md:hidden fixed-bottom-nav ${isIOS ? 'fixed-bottom-ios' : ''}`}
      style={{ 
        paddingBottom: 'var(--safe-area-inset-bottom)',
        bottom: 0,
        margin: 0
      }}
    >
      <div className={`grid h-[74px] ${showActionButton ? 'grid-cols-5' : 'grid-cols-4'} max-w-screen-sm mx-auto`}>
        {/* First half of navigation items */}
        {itemsToShow.slice(0, showActionButton ? 2 : 2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center relative"
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-200'}`} />
              <span className={`text-xs mt-1 truncate w-full text-center ${
                isActive ? 'text-white font-medium' : 'text-blue-200'
              }`}>{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-1 bg-white rounded-t-full"></div>
              )}
            </Link>
          );
        })}
        
        {/* Center Action Button - only for organizers and admins */}
        {showActionButton && (
          <button
            onClick={onCreateEvent}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full -mt-6 shadow-lg">
              <Plus className="w-6 h-6 text-blue-800" />
            </div>
          </button>
        )}
        
        {/* Second half of navigation items */}
        {itemsToShow.slice(showActionButton ? 2 : 2, showActionButton ? 4 : 4).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center relative"
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-200'}`} />
              <span className={`text-xs mt-1 truncate w-full text-center ${
                isActive ? 'text-white font-medium' : 'text-blue-200'
              }`}>{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-1 bg-white rounded-t-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}; 