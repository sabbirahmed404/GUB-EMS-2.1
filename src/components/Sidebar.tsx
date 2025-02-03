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
  X
} from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ mobile, onClose }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleItemClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  const navigationItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard
    },
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
    {
      name: 'Participants',
      path: '/dashboard/participants',
      icon: Users
    },
    {
      name: 'Team',
      path: '/dashboard/team',
      icon: UserPlus
    },
    {
      name: 'Planning',
      path: '/dashboard/planning',
      icon: Plane
    },
    {
      name: 'Help',
      path: '/dashboard/help',
      icon: HelpCircle
    }
  ];

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center flex-shrink-0 px-4">
          <Logo size="lg" className="scale-150" />
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleItemClick}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive
                      ? 'text-gray-500'
                      : 'text-gray-400 group-hover:text-gray-500'
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