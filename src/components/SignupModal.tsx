import { X, ArrowRight, Apple, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { useAuth } from '../contexts/AuthContext';

interface SignupModalProps {
  onClose: () => void;
}

export default function SignupModal({ onClose }: SignupModalProps) {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create your account</h2>
          
          {/* Social login buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FcGoogle className="h-5 w-5" />
              <span className="ml-3 text-gray-700 font-medium">Continue with Google</span>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
              <BsMicrosoft className="h-5 w-5 text-[#00A4EF]" />
              <span className="ml-3 text-gray-700 font-medium">Continue with Microsoft</span>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed">
              <Apple className="h-5 w-5" />
              <span className="ml-3 text-gray-700 font-medium">Continue with Apple</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-sm text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:text-accent">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:text-accent">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}