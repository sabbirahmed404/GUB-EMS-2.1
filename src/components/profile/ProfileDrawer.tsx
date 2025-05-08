import React, { useState, useRef, useEffect } from "react";
import { UserCircle, Edit2, LogOut, X, Search, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Predefined club list
const CLUBS = [
  "Debating Club",
  "Green Theatre",
  "Photography Club",
  "Sports Club",
  "Cultural Club",
  "Eco Warrior Club",
  "Green Reading Society",
  "Green Blood Club",
  "Green Marketing Club",
  "Green Business Club",
  "EEE Club",
  "Textile Club",
  "Law Club",
  "English Club",
  "Computer Club",
  "Social Bonding Club",
  "FTDM Club",
  "SWE Club",
  "ADS Club",
  "CETL",
  "CLS"
];

// Predefined positions
const POSITIONS = [
  "President",
  "Vice President",
  "General Secretary",
  "Joint Secretary",
  "Treasurer",
  "Joint Treasurer",
  "Organizing Secretary",
  "Joint Organizing Secretary",
  "Publication Secretary",
  "Joint Publication Secretary",
  "Information Secretary",
  "Joint Information Secretary",
  "Cultural Secretary",
  "Event Manager",
  "Program Co-Ordinator",
  "General Member",
  "Executive Member",
  "Advisor",
  "Mentor",
  "Deputy Mentor"
];

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { profile, user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [clubSearch, setClubSearch] = useState("");
  const [positionSearch, setPositionSearch] = useState("");
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  
  // Refs for dropdown containment
  const clubInputRef = useRef<HTMLInputElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    role_in_institute: profile?.role_in_institute || "",
    description: profile?.description || "",
    club: profile?.club || "",
    club_position: profile?.club_position || ""
  });
  
  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        role_in_institute: profile.role_in_institute || "",
        description: profile.description || "",
        club: profile.club || "",
        club_position: profile.club_position || ""
      });
    }
  }, [profile]);
  
  // Filter clubs based on search
  const filteredClubs = CLUBS.filter(club => 
    club.toLowerCase().includes(clubSearch.toLowerCase())
  );
  
  // Filter positions based on search
  const filteredPositions = POSITIONS.filter(position => 
    position.toLowerCase().includes(positionSearch.toLowerCase())
  );
  
  // Effect to handle clicking outside the dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clubInputRef.current && !clubInputRef.current.contains(event.target as Node)) {
        setShowClubDropdown(false);
      }
      if (positionInputRef.current && !positionInputRef.current.contains(event.target as Node)) {
        setShowPositionDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // For club input, update search and show dropdown
    if (name === "club") {
      setClubSearch(value);
      setShowClubDropdown(true);
    }
    
    // For position input, update search and show dropdown
    if (name === "club_position") {
      setPositionSearch(value);
      setShowPositionDropdown(true);
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClubSelect = (club: string) => {
    setFormData(prev => ({
      ...prev,
      club
    }));
    setClubSearch(club);
    setShowClubDropdown(false);
  };
  
  const handlePositionSelect = (position: string) => {
    setFormData(prev => ({
      ...prev,
      club_position: position
    }));
    setPositionSearch(position);
    setShowPositionDropdown(false);
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      const updatedProfile = {
        full_name: formData.full_name,
        role_in_institute: formData.role_in_institute,
        description: formData.description,
        club: formData.club,
        club_position: formData.club_position
      };
      
      await updateUserProfile(updatedProfile);
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full max-w-md w-full rounded-l-lg border-l">
        <DrawerHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-semibold">My Profile</DrawerTitle>
            <DrawerClose className="rounded-full p-2 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <UserCircle className="h-24 w-24 text-primary/80" />
                )}
                <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
                <p className="text-gray-500">{profile?.email}</p>
              </div>
              
              <div className="grid gap-5 mt-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Role in Institute</h3>
                  <p className="text-base">{profile?.role_in_institute || "Not specified"}</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-base">{profile?.description || "No description"}</p>
                </div>
                
                {profile?.role === "organizer" && (
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Organizer Status</p>
                    <p className="text-xs text-gray-500 mt-1">Not Active</p>
                    <p className="text-xs text-gray-500 mt-1">Code: {profile.organizer_code}</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Club Associated With</h3>
                  <p className="text-base">{profile?.club || "Not specified"}</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Club Position</h3>
                  <p className="text-base">{profile?.club_position || "Not specified"}</p>
                </div>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <Button 
                  className="flex-1 text-white" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    value={profile?.email}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role_in_institute">Role in Institute</Label>
                  <Select
                    value={formData.role_in_institute}
                    onValueChange={(value) => handleSelectChange("role_in_institute", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Faculty">Faculty</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                </div>
                
                {profile?.role === "organizer" && (
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Organizer Status</p>
                    <p className="text-xs text-gray-500 mt-1">Not Active</p>
                    <p className="text-xs text-gray-500 mt-1">Code: {profile.organizer_code}</p>
                  </div>
                )}
                
                <div className="space-y-2 relative">
                  <Label htmlFor="club">Club Associated With</Label>
                  <div className="relative" ref={clubInputRef}>
                    <Input
                      id="club"
                      name="club"
                      value={formData.club}
                      onChange={(e) => {
                        handleChange(e);
                        setClubSearch(e.target.value);
                        setShowClubDropdown(true);
                      }}
                      onFocus={() => setShowClubDropdown(true)}
                      autoComplete="off"
                      placeholder="Start typing to search clubs"
                    />
                    {showClubDropdown && (
                      <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filteredClubs.length > 0 ? (
                          filteredClubs.map((club) => (
                            <div
                              key={club}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData({ ...formData, club });
                                setShowClubDropdown(false);
                              }}
                            >
                              {club}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No clubs found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 relative">
                  <Label htmlFor="club_position">Club Position</Label>
                  <div className="relative" ref={positionInputRef}>
                    <Input
                      id="club_position"
                      name="club_position"
                      value={formData.club_position}
                      onChange={(e) => {
                        handleChange(e);
                        setPositionSearch(e.target.value);
                        setShowPositionDropdown(true);
                      }}
                      onFocus={() => setShowPositionDropdown(true)}
                      autoComplete="off"
                      placeholder="Start typing to search positions"
                    />
                    {showPositionDropdown && (
                      <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {filteredPositions.length > 0 ? (
                          filteredPositions.map((position) => (
                            <div
                              key={position}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData({ ...formData, club_position: position });
                                setShowPositionDropdown(false);
                              }}
                            >
                              {position}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No positions found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
} 