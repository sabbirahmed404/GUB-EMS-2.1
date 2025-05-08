import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-primary/95 flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
        <p className="text-white mt-4 font-medium">Loading...</p>
      </div>
    </div>
  );
}