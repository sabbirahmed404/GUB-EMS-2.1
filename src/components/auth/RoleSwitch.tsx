import { useAuth } from '../../contexts/AuthContext';

export const RoleSwitch = () => {
  const { profile, updateUserRole } = useAuth();

  const handleRoleChange = async () => {
    if (!profile) return;
    
    try {
      const newRole = profile.role === 'organizer' ? 'visitor' : 'organizer';
      await updateUserRole(newRole);
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