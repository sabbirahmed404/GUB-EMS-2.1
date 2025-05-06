import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Users, RefreshCw, Eye, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { UserDetailsDrawer } from '@/components/admin/UserDetailsDrawer';
import { useNavigate } from 'react-router-dom';

interface User {
  user_id: string;
  auth_id: string;
  username: string;
  full_name: string;
  email: string;
  role: 'organizer' | 'visitor';
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  organizer_code?: string;
}

export default function SuperAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not an organizer (only organizers can access admin)
    if (profile && profile.role !== 'organizer') {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, [profile, roleFilter, navigate]);

  const fetchUsers = async () => {
    if (!profile?.user_id) return;
    
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase().trim();
    if (!searchTerms) return true;
    
    return (
      user.full_name?.toLowerCase().includes(searchTerms) ||
      user.email?.toLowerCase().includes(searchTerms) ||
      user.username?.toLowerCase().includes(searchTerms)
    );
  });

  if (!profile) {
    return <LoadingSpinner />;
  }

  // If the user is not an organizer, don't render the admin page
  if (profile.role !== 'organizer') {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <ShieldCheck className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-700">Access Restricted</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access the admin area.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-gray-600">Manage all users and their roles</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex items-center w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search users..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setRoleFilter(roleFilter === 'all' ? 'visitor' : 'all')}
            >
              <Filter className="h-4 w-4" />
              {roleFilter === 'all' ? 'All Users' : roleFilter === 'visitor' ? 'Visitors' : 'Organizers'}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setRoleFilter(roleFilter === 'organizer' ? 'all' : 'organizer')}
            >
              <Users className="h-4 w-4" />
              {roleFilter === 'organizer' ? 'All Users' : 'Organizers'}
            </Button>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={fetchUsers}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only md:not-sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Thead>
                <Tr className="bg-gray-50 text-left">
                  <Th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</Th>
                  <Th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</Th>
                  <Th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</Th>
                  <Th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</Th>
                  <Th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </Td>
                  </Tr>
                ) : (
                  filteredUsers.map((user) => (
                    <Tr key={user.user_id} className="border-t border-gray-200">
                      <Td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                            ) : (
                              <Users className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </Td>
                      <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </Td>
                      <Td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'organizer' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        {user.organizer_code && (
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {user.organizer_code}
                          </div>
                        )}
                      </Td>
                      <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Td>
                      <Td className="px-6 py-4 whitespace-nowrap text-sm">
                        <UserDetailsDrawer
                          userId={user.user_id}
                          trigger={
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          }
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
} 