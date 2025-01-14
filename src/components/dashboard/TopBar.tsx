import { Star, HelpCircle, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const [showTooltip, setShowTooltip] = useState('');

  const icons = [
    { icon: Star, label: 'GenAI', id: 'genai' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: MoreVertical, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="fixed top-0 right-0 h-20 flex items-center px-6 gap-4">
      {icons.map(({ icon: Icon, label, id }) => (
        <div key={id} className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onMouseEnter={() => setShowTooltip(id)}
            onMouseLeave={() => setShowTooltip('')}
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
      
      <div className="relative ml-4">
        <button
          className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"
          onMouseEnter={() => setShowTooltip('profile')}
          onMouseLeave={() => setShowTooltip('')}
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
        {showTooltip === 'profile' && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded whitespace-nowrap">
            Profile
          </div>
        )}
      </div>
    </div>
  );
}