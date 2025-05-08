import { useAuth } from '@/contexts/AuthContext';

export function DashboardHeader() {
  const { profile } = useAuth();
  
  // Get current time to determine greeting
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  
  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
  }

  return (
    <header className="mb-8">
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Here's what's happening with your events today.
        </p>
      </div>
    </header>
  );
} 