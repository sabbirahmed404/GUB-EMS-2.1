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

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-md md:hidden bg-white shadow-lg hover:bg-gray-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Event Manager</h2>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md transition-colors
                ${location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} />
              <span className="ml-4">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}; 