import { Star, HelpCircle, MoreVertical, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function TopBar() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [showTooltip, setShowTooltip] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user name:', error);
          return;
        }

        if (data) {
          console.log('User name fetched:', data.full_name);
          setUserName(data.full_name);
        }
      } catch (err) {
        console.error('Error in fetchUserName:', err);
      }
    };

    fetchUserName();
  }, [user?.id]);

  const icons = [
    ...(profile?.role === 'organizer' ? [{
      icon: PlusCircle,
      label: 'Create Event',
      id: 'create-event',
      onClick: () => {
        console.log('Navigating to create event page');
        navigate('/dashboard/events/create');
      }
    }] : []),
    { icon: Star, label: 'GenAI', id: 'genai' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: MoreVertical, label: 'Settings', id: 'settings' }
  ];

  return (
    <div className="fixed top-0 right-0 h-20 flex items-center px-6 gap-4">
      {icons.map(({ icon: Icon, label, id, onClick }) => (
        <div key={id} className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onMouseEnter={() => setShowTooltip(id)}
            onMouseLeave={() => setShowTooltip('')}
            onClick={onClick}
          >
            <Icon className="text-gray-600" size={20} />
          </button>
          {showTooltip === id && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap">
              {label}
            </div>
          )}
        </div>
      ))}
      
      <div className="relative ml-4 flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{userName || profile?.full_name || 'Loading...'}</p>
          <p className="text-xs text-gray-500 capitalize">{profile?.role || ''}</p>
        </div>
        <button
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"
          onMouseEnter={() => setShowTooltip('profile')}
          onMouseLeave={() => setShowTooltip('')}
        >
          <img
            src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt={userName || profile?.full_name || 'Profile'}
            className="w-full h-full object-cover"
          />
        </button>
        {showTooltip === 'profile' && (
          <div className="absolute -bottom-8 right-0 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap">
            View Profile
          </div>
        )}
      </div>
    </div>
  );
}