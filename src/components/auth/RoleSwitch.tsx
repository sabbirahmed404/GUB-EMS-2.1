import { useAuth } from '../../contexts/AuthContext';
import type { Role } from '../../contexts/AuthContext';

export const RoleSwitch = () => {
  const { profile, updateUserRole } = useAuth();

  const handleRoleChange = async () => {
    if (!profile) {
      console.error('No profile found for role switch');
      return;
    }
    
    try {
      console.log('Current role:', profile.role);
      // Cycle through roles: organizer -> admin -> visitor -> organizer
      let newRole: Role;
      if (profile.role === 'organizer') {
        newRole = 'admin';
      } else if (profile.role === 'admin') {
        newRole = 'visitor';
      } else {
        newRole = 'organizer';
      }
      console.log('Switching to role:', newRole);
      await updateUserRole(newRole);
      console.log('Role switch successful');
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  if (!profile) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">
        {profile.full_name}
      </span>
      <span className="text-gray-300">|</span>
      <button
        onClick={handleRoleChange}
        className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        Current Role: {profile.role}
        <span className="ml-2 text-blue-600 hover:text-blue-700">(Switch)</span>
      </button>
    </div>
  );
}; 