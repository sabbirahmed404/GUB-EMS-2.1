import React, { useState } from "react";
import { UserCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { ProfileDrawer } from "./ProfileDrawer";

export function ProfileButton() {
  const { profile } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <>
      <Button 
        variant="ghost-inverse" 
        size="icon" 
        className="rounded-full w-10 h-10 p-0 overflow-hidden bg-white/10 backdrop-blur-sm" 
        onClick={() => setDrawerOpen(true)}
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.full_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircle className="h-7 w-7 text-white" />
        )}
      </Button>
      
      <ProfileDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
      />
    </>
  );
} 