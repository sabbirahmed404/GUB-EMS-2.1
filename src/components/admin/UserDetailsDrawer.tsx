import { useState, useEffect } from "react";
import { X, User, Mail, Calendar, Shield, Edit, ChevronRight, FileText, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminSupabase } from "@/lib/adminSupabase";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminAccessError, setAdminAccessError] = useState(false);

  const fetchUserData = async () => {
    if (!userId || !open) return;

    try {
      setLoading(true);
      setError(null);
      setAdminAccessError(false);

      // Fetch user details
      const { data: userData, error: userError } = await adminSupabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        // Check if the error is related to service role key
        if (userError.message.includes('service_role') || userError.message.includes('permission') || userError.message.includes('JWT')) {
          setAdminAccessError(true);
          throw new Error('Admin access unavailable. Please check your service role key configuration.');
        }
        throw userError;
      }

      // Fetch events created by the user
      const { data: eventsData, error: eventsError } = await adminSupabase
        .from('events')
        .select('event_id, event_name, organizer_name, start_date, end_date')
        .eq('created_by', userId);

      if (eventsError) throw eventsError;

      // Fetch events where user is a participant using our new function
      console.log('Fetching user participated events with ID:', userId);
      const { data: participatedData, error: participatedError } = await adminSupabase
        .rpc('get_user_participated_events', { 
          user_id_param: userId 
        });

      if (participatedError) {
        console.error('Error fetching participated events:', participatedError);
        console.error('Error details:', participatedError.details);
        console.error('Error message:', participatedError.message);
        throw participatedError;
      }

      // Transform the participatedData to match our interface
      const transformedParticipatedData = participatedData?.map((item: {
        status: string;
        event_id: string;
        event_name: string;
        organizer_name: string;
        start_date: string;
        end_date: string;
      }) => ({
        status: item.status,
        event: {
          event_id: item.event_id,
          event_name: item.event_name,
          organizer_name: item.organizer_name,
          start_date: item.start_date,
          end_date: item.end_date
        }
      })) || [];

      setUser(userData);
      setCreatedEvents(eventsData || []);
      setParticipatedEvents(transformedParticipatedData);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (newRole: Role) => {
    if (!user) return;
    
    try {
      setUpdating(true);
      setAdminAccessError(false);
      
      // Generate an organizer code if becoming an organizer and doesn't have one
      let organizerCode = user.organizer_code;
      if (newRole === 'organizer' && !organizerCode) {
        organizerCode = `ORG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
      
      console.log("Updating user role:", {
        userId,
        currentRole: user.role,
        newRole,
        organizerCode
      });
      
      // Try to use the RPC function first
      console.log("Calling admin_update_user_role with:", {
        target_user_id: userId,
        new_role: newRole,
        new_organizer_code: newRole === 'organizer' ? organizerCode : null
      });
      
      const { data: rpcData, error } = await adminSupabase.rpc('admin_update_user_role', {
        target_user_id: userId,
        new_role: newRole,
        new_organizer_code: newRole === 'organizer' ? organizerCode : null
      });
      
      let finalData;
      
      if (error) {
        console.error("Admin function call failed:", error);
        
        // Log the error details
        if (error.message) {
          console.error("Error message:", error.message);
        }
        if (error.details) {
          console.error("Error details:", error.details);
        }
        if (error.hint) {
          console.error("Error hint:", error.hint);
        }
        
        // Fallback to using the update method with service role client
        console.log("Falling back to direct update method");
        const { data: updateData, error: updateError } = await adminSupabase
          .from('users')
          .update({ 
            role: newRole,
            organizer_code: newRole === 'organizer' ? organizerCode : null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (updateError) {
          console.error("Direct update failed:", updateError);
          throw new Error(`Role update failed: ${updateError.message || 'Unknown error'}`);
        }
        
        console.log("Direct update succeeded:", updateData);
        finalData = updateData;
      } else {
        console.log("RPC function update succeeded:", rpcData);
        finalData = rpcData;
      }
      
      // Update state
      setUser(prev => prev ? { 
        ...prev, 
        role: newRole, 
        organizer_code: newRole === 'organizer' ? organizerCode : undefined
      } : null);
      toast.success(`User role updated to ${newRole}`);
      
      // Refresh user data 
      fetchUserData();
    } catch (err) {
      console.error('Error updating user role:', err);
      
      // More detailed error handling
      let errorMessage = 'Failed to update user role';
      if (err instanceof Error) {
        errorMessage = `Role update failed: ${err.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!eventId) return;
    
    try {
      setIsDeleting(true);
      setAdminAccessError(false);
      
      // Delete participants first (foreign key constraint)
      const { error: participantsError } = await adminSupabase
        .from('participants')
        .delete()
        .eq('event_id', eventId);
      
      if (participantsError) {
        if (participantsError.message.includes('service_role') || participantsError.message.includes('permission') || participantsError.message.includes('JWT')) {
          setAdminAccessError(true);
          throw new Error('Admin access unavailable. Please check your service role key configuration.');
        }
        throw participantsError;
      }
      
      // Delete event
      const { error: eventError } = await adminSupabase
        .from('events')
        .delete()
        .eq('event_id', eventId);
      
      if (eventError) throw eventError;
      
      // Update the events list
      setCreatedEvents(prevEvents => prevEvents.filter(event => event.event_id !== eventId));
      toast.success("Event deleted successfully");
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [userId, open]);

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <DrawerContent className="h-full max-w-md w-full rounded-l-lg bg-white border-l">
          <div className="h-full flex flex-col">
            <DrawerHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-xl font-semibold">User Details</DrawerTitle>
                <DrawerClose className="rounded-full p-2 hover:bg-gray-100 mt-2">
                  <X className="h-5 w-5" />
                </DrawerClose>
              </div>
            </DrawerHeader>

            {adminAccessError && (
              <div className="bg-yellow-50 text-yellow-800 p-4 m-4 rounded-md">
                <h4 className="font-semibold">Admin Access Error</h4>
                <p className="text-sm">Unable to perform admin operations. Please check the service role key configuration.</p>
              </div>
            )}

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
                          : user.role === 'admin'
                            ? 'Has administrative privileges'
                            : 'Can only participate in events'}
                      </p>
                    </div>
                    {user.role !== 'admin' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Visitor</span>
                        <Switch
                          checked={user.role === 'organizer'}
                          onCheckedChange={(checked) => {
                            const newRole = checked ? 'organizer' : 'visitor';
                            // Confirm before making the change
                            if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
                              updateUserRole(newRole);
                            }
                          }}
                          disabled={updating}
                        />
                        <span className="text-sm text-gray-600">Organizer</span>
                        {updating && (
                          <span className="text-xs text-blue-600 animate-pulse ml-2">
                            Updating...
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Admin</span>
                      </div>
                    )}
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

                {/* Events Created - Now with delete functionality */}
                {user.role === 'organizer' && (
                  <div className="border-b pb-4 mb-4">
                    <h4 className="font-medium mb-3">Events Created ({createdEvents.length})</h4>
                    {createdEvents.length === 0 ? (
                      <p className="text-sm text-gray-500">No events created yet</p>
                    ) : (
                      <div className="space-y-2">
                        {createdEvents.map(event => (
                          <div key={event.event_id} className="bg-gray-50 p-3 rounded-md text-sm">
                            <div className="flex justify-between">
                              <div className="font-medium">{event.event_name}</div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={() => handleDeleteClick(event)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Confirmation Dialog for Event Deletion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.event_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && deleteEvent(eventToDelete.event_id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 