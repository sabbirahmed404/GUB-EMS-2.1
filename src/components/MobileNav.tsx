import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserPlus, Users, Plus } from 'lucide-react';

interface MobileNavProps {
  onCreateEvent: () => void;
}

export const MobileNav = ({ onCreateEvent }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Events',
      path: '/dashboard/events',
      icon: Calendar,
    },
    {
      name: 'Reg',
      path: '/dashboard/registrations',
      icon: UserPlus,
    },
    {
      name: 'Participants',
      path: '/dashboard/participants',
      icon: Users,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-[74px] bg-white border-t border-gray-200 md:hidden">
      <div className="grid h-full grid-cols-5 max-w-screen-sm mx-auto">
        {navigationItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center -translate-y-[5px] ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs mt-1 truncate w-full text-center">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Center Action Button */}
        <button
          onClick={onCreateEvent}
          className="flex flex-col items-center justify-center -translate-y-[5px]"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full -mt-6 shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>
        
        {navigationItems.slice(2, 4).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center -translate-y-[5px] ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-xs mt-1 truncate w-full text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}; 