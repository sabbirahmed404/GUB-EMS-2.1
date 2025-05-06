import { useState, useEffect } from "react";
import { X, User, Mail, Calendar, Shield, Edit, ChevronRight, FileText, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Switch } from "@/components/ui/switch";
import { Role } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserDetailsDrawerProps {
  userId: string;
  trigger: React.ReactNode;
}

interface UserDetails {
  user_id: string;
  auth_id: string;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar_url?: string;
  organizer_code?: string;
  role_in_institute?: string;
  description?: string;
  club?: string;
  club_position?: string;
  created_at: string;
  updated_at: string;
}

interface Event {
  event_id: string;
  event_name: string;
  organizer_name: string;
  start_date: string;
  end_date: string;
}

interface ParticipatedEvent {
  event: Event;
  status: string;
}

export function UserDetailsDrawer({ userId, trigger }: UserDetailsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<ParticipatedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUserData = async () => {
    if (!userId || !open) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;

      // Fetch events created by the user
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('event_id, event_name, organizer_name, start_date, end_date')
        .eq('created_by', userId);

      if (eventsError) throw eventsError;

      // Fetch events where user is a participant
      const { data: participatedData, error: participatedError } = await supabase
        .from('participants')
        .select(`
          status,
          event:events (
            event_id,
            event_name,
            organizer_name,
            start_date,
            end_date
          )
        `)
        .eq('user_id', userId);

      if (participatedError) throw participatedError;

      // Transform the participatedData to match our interface
      const transformedParticipatedData = participatedData?.map(item => ({
        status: item.status,
        event: Array.isArray(item.event) && item.event[0] ? item.event[0] : {
          event_id: '',
          event_name: 'Unknown Event',
          organizer_name: '',
          start_date: '',
          end_date: ''
        }
      })) || [];

      setUser(userData);
      setCreatedEvents(eventsData || []);
      setParticipatedEvents(transformedParticipatedData);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (newRole: Role) => {
    if (!user) return;
    
    try {
      setUpdating(true);
      
      // Generate an organizer code if becoming an organizer and doesn't have one
      let organizerCode = user.organizer_code;
      if (newRole === 'organizer' && !organizerCode) {
        organizerCode = `ORG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          ...(organizerCode ? { organizer_code: organizerCode } : {})
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      setUser(prev => prev ? { ...prev, role: newRole, organizer_code: organizerCode } : null);
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [userId, open]);

  const handleToggleRole = () => {
    if (!user) return;
    const newRole: Role = user.role === 'organizer' ? 'visitor' : 'organizer';
    updateUserRole(newRole);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DrawerContent className="h-full max-w-md w-full rounded-l-lg bg-white border-l">
        <div className="h-full flex flex-col">
          <DrawerHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-semibold">User Details</DrawerTitle>
              <DrawerClose className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </DrawerClose>
            </div>
          </DrawerHeader>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex-1 p-4 text-red-600">{error}</div>
          ) : user ? (
            <div className="flex-1 overflow-y-auto p-4">
              {/* User Profile */}
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full" />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{user.full_name}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>

              {/* Role Toggle */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      <span>User Role</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {user.role === 'organizer' 
                        ? 'Can create and manage events' 
                        : 'Can only participate in events'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Organizer</span>
                    <Switch
                      checked={user.role === 'organizer'}
                      onCheckedChange={handleToggleRole}
                      disabled={updating}
                    />
                  </div>
                </div>
                {user.role === 'organizer' && user.organizer_code && (
                  <div className="mt-2 text-sm text-gray-600">
                    Organizer Code: {user.organizer_code}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-b pb-4 mb-4">
                <h4 className="font-medium mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-b pb-4 mb-4">
                <h4 className="font-medium mb-3">Additional Information</h4>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-500">Role in Institute:</span> {user.role_in_institute || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Club:</span> {user.club || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Club Position:</span> {user.club_position || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Account Created:</span> {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              {user.description && (
                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Description</span>
                  </h4>
                  <p className="text-sm text-gray-700">{user.description}</p>
                </div>
              )}

              {/* Events Created */}
              {user.role === 'organizer' && (
                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium mb-3">Events Created ({createdEvents.length})</h4>
                  {createdEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">No events created yet</p>
                  ) : (
                    <div className="space-y-2">
                      {createdEvents.map(event => (
                        <div key={event.event_id} className="bg-gray-50 p-3 rounded-md text-sm">
                          <div className="font-medium">{event.event_name}</div>
                          <div className="text-gray-500 text-xs">
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Participated Events */}
              <div>
                <h4 className="font-medium mb-3">Events Participated ({participatedEvents.length})</h4>
                {participatedEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No event participations</p>
                ) : (
                  <div className="space-y-2">
                    {participatedEvents.map((participation, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md text-sm">
                        <div className="font-medium">{participation.event.event_name}</div>
                        <div className="flex justify-between">
                          <div className="text-gray-500 text-xs">
                            {new Date(participation.event.start_date).toLocaleDateString()}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${
                            participation.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participation.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 text-gray-500">User not found</div>
          )}

          <DrawerFooter className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 