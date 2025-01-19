import { useAuth } from '../../contexts/AuthContext';

export const RoleSwitch = () => {
  const { profile, updateUserRole } = useAuth();

  const handleRoleChange = async () => {
    if (!profile) {
      console.error('No profile found for role switch');
      return;
    }
    
    try {
      console.log('Current role:', profile.role);
      const newRole = profile.role === 'organizer' ? 'visitor' : 'organizer';
      console.log('Switching to role:', newRole);
      await updateUserRole(newRole);
      console.log('Role switch successful');
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  if (!profile) return null;

  return (
    <button
      onClick={handleRoleChange}
      className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
    >
      Current Role: {profile.role}
      <span className="ml-2 text-blue-600 hover:text-blue-700">(Switch)</span>
    </button>
  );
}; 