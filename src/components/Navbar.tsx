import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-4 z-50 mx-[60px]">
      <div className="bg-gradient-to-r from-[#5465ff]/70 via-[#788bff]/70 to-[#9bb1ff]/70 backdrop-blur-sm rounded-2xl shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLinks />
              <SignUpButton />
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-gradient-to-r from-[#5465ff]/70 via-[#788bff]/70 to-[#9bb1ff]/70 backdrop-blur-sm border-t border-white/10">
            <div className="px-6 py-3 space-y-3">
              <MobileNavLinks />
              <SignUpButton className="w-full justify-center" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLinks() {
  return (
    <>
      <Link to="/" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Home
      </Link>
      <Link to="/events" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Events
      </Link>
      <Link to="/tickets" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Register
      </Link>
      <Link to="/about" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        About
      </Link>
    </>
  );
}

function MobileNavLinks() {
  return (
    <div className="flex flex-col space-y-3">
      <Link to="/" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Home
      </Link>
      <Link to="/events" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Events
      </Link>
      <Link to="/tickets" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        Register
      </Link>
      <Link to="/about" className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
        About
      </Link>
    </div>
  );
}

function SignUpButton({ className = '' }) {
  return (
    <Link 
      to="/register" 
      className={`flex items-center px-6 py-2 bg-[#788bff] hover:bg-white/10 text-white rounded-full transition-colors duration-300 ${className}`}
    >
      <span>Sign Up</span>
      <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  );
}