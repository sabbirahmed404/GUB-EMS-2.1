import { X, ArrowRight, Apple, Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';

interface SignupModalProps {
  onClose: () => void;
}

export default function SignupModal({ onClose }: SignupModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md relative animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create your account</h2>
          
          {/* Sign up form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FcGoogle className="h-5 w-5" />
              <span className="ml-3 text-gray-700 font-medium">Continue with Google</span>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <BsMicrosoft className="h-5 w-5 text-[#00A4EF]" />
              <span className="ml-3 text-gray-700 font-medium">Continue with Microsoft</span>
            </button>
            
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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