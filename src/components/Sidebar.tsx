import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Plane,
  HelpCircle,
  Menu,
  X,
  ShieldCheck,
  UsersRound
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobile, onClose }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();
  
  // Check if the user has superadmin role
  // User with role 'organizer' or 'admin' can access superadmin
  const isSuperAdmin = profile?.role === 'organizer' || profile?.role === 'admin';
  const isVisitor = profile?.role === 'visitor';
  
  // Debug info - remove in production
  console.log('Sidebar Profile:', { 
    role: profile?.role, 
    id: profile?.user_id,
    canAccessAdmin: isSuperAdmin,
    isVisitor
  });

  const handleItemClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const navigationItems = [
    // Only show Overview for non-visitors (organizer and admin)
    ...(!isVisitor ? [
      {
        name: 'My Events',
        path: '/dashboard',
        icon: LayoutDashboard
      }
    ] : []),
    {
      name: 'All Events',
      path: '/dashboard/events',
      icon: Calendar
    },
    {
      name: 'Registrations',
      path: '/dashboard/registrations',
      icon: UserPlus
    },
    // Hide Participants from visitors
    ...(!isVisitor ? [
      {
        name: 'Participants',
        path: '/dashboard/participants',
        icon: Users
      }
    ] : []),
    // Add Organizers page for all users
    {
      name: 'Organizers',
      path: '/dashboard/organizers',
      icon: UsersRound
    },
    {
      name: 'Help',
      path: '/dashboard/help',
      icon: HelpCircle
    },
    // Always include SuperAdmin for organizers and admins
    ...(isSuperAdmin ? [{
      name: 'Super Admin',
      path: '/dashboard/superadmin',
      icon: ShieldCheck
    }] : [])
  ];

  return (
    <div className="flex h-full flex-col text-white min-h-screen">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4">
          <Logo size="lg" className="scale-150" />
        </div>
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleItemClick}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-800 shadow-md'
                    : 'text-blue-50 hover:bg-blue-700/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-blue-200 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}; 