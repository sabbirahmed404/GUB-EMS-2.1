import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import SignupModal from './SignupModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-[50px] pt-4">
        <div className="bg-secondary/70 backdrop-blur-sm rounded-2xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-white text-2xl font-bold">GUB-EMS</Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">Home</Link>
                <Link to="/events" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">Events</Link>
                <Link to="/tickets" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">Register</Link>
                <Link to="/about" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">About</Link>
                <SignUpButton onClick={() => setShowSignup(true)} />
              </div>

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden border-t border-white/10">
              <div className="px-4 pt-2 pb-3 space-y-1">
                <Link 
                  to="/" 
                  className="block text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/events" 
                  className="block text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Events
                </Link>
                <Link 
                  to="/tickets" 
                  className="block text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
                <Link 
                  to="/about" 
                  className="block text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <div className="pt-2">
                  <SignUpButton onClick={() => {
                    setIsOpen(false);
                    setShowSignup(true);
                  }} className="w-full justify-center" />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </>
  );
}

function SignUpButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-2 bg-[#788bff] hover:bg-white/10 text-white rounded-full transition-colors duration-300 ${className}`}
    >
      <span>Sign Up</span>
      <ArrowRight className="ml-2 h-4 w-4" />
    </button>
  );
}