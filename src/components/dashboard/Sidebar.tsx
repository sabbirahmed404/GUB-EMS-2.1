import { useState } from 'react';
import { Menu, X, Home, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: Calendar, label: 'Events', path: '/dashboard/events' },
    { icon: Users, label: 'Participants', path: '/dashboard/participants' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-50 
      ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Rest of the component remains the same until the logout button */}
      <div className="p-6 border-t">
        <button 
          onClick={handleLogout}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <LogOut size={20} />
          <span className={`ml-4 transition-opacity duration-200 
            ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}