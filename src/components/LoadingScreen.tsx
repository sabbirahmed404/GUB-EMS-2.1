import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-r from-[#5465ff]/95 via-[#788bff]/95 to-[#9bb1ff]/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
        <div className="relative">
          <div className="h-2 w-48 bg-white/20 rounded-full overflow-hidden">
          </div>
        </div>
        <p className="text-white mt-4 font-medium">Loading amazing events...</p>
      </div>
    </div>
  );
}