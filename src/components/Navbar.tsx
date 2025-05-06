import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import SignupModal from './SignupModal';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';

interface SignUpButtonProps {
  onClick: () => void;
  className?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const scrollRef = useRef(false);

  // Add forced scroll check on mount and window resize
  useEffect(() => {
    // Force check scroll immediately and after a delay
    const checkScroll = () => {
      const isScrolled = window.scrollY > 5; // Lower threshold for easier triggering
      setScrolled(isScrolled);
      scrollRef.current = isScrolled;
    };

    // Run on mount
    checkScroll();
    
    // Run after a short delay to ensure all layout is completed
    const timer1 = setTimeout(checkScroll, 100);
    const timer2 = setTimeout(checkScroll, 500);
    
    // Also check on window resize as layout might change
    window.addEventListener('resize', checkScroll);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Main scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 5; // Lower threshold for easier triggering
      
      if (isScrolled !== scrollRef.current) {
        setScrolled(isScrolled);
        scrollRef.current = isScrolled;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define the background style for when scrolled
  const scrolledStyle = {
    background: `linear-gradient(to right, ${colors.navGradientStart}, ${colors.navGradientEnd})`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', // For Safari
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  };

  // Define the background style for when not scrolled
  const notScrolledStyle = {
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    boxShadow: 'none',
    padding: '1rem 0',
    borderBottom: 'none',
  };

  // Combine styles based on scroll state
  const navStyle = scrolled ? scrolledStyle : notScrolledStyle;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 transition-all duration-300 ${scrolled ? 'scrolled-nav' : ''}`}
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-white font-bold flex items-center"
            >
              <span className="text-2xl mr-1">GUB</span>
              <div className="flex items-center">
                <span className="text-accent font-extrabold text-2xl">-</span>
                <span className="text-accent font-extrabold text-2xl">EMS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/" label="Home" active={location.pathname === '/'} />
              <NavLink to="/events" label="Events" active={location.pathname === '/events'} />
              <NavLink to="/about" label="About" active={location.pathname === '/about'} />
              <NavLink to="/contact" label="Contact" active={location.pathname === '/contact'} />
              
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="ml-2 flex items-center px-6 py-2 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: colors.primary,
                    border: `1px solid ${colors.accent}`,
                  }}
                >
                  <span>Dashboard</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <SignUpButton onClick={() => setShowSignup(true)} className="ml-2" />
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            className="md:hidden absolute top-full left-0 right-0 shadow-xl rounded-b-xl overflow-hidden"
            style={{ 
              background: `linear-gradient(to bottom, ${colors.navGradientStart}f2, ${colors.navGradientEnd}f2)`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div className="px-4 py-4 space-y-3">
              <MobileNavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/events" label="Events" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/about" label="About" onClick={() => setIsOpen(false)} />
              <MobileNavLink to="/contact" label="Contact" onClick={() => setIsOpen(false)} />
              
              <div className="pt-3 pb-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center w-full px-6 py-3 text-white rounded-xl transition-all"
                    style={{
                      backgroundColor: colors.primary,
                      border: `1px solid ${colors.accent}`,
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <SignUpButton 
                    onClick={() => {
                      setIsOpen(false);
                      setShowSignup(true);
                    }} 
                    className="w-full justify-center py-3" 
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
        active 
          ? 'text-white bg-white/10' 
          : 'text-white/80 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link 
      to={to} 
      className="block text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function SignUpButton({ onClick, className = '' }: SignUpButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${className}`}
    >
      <span>Sign Up</span>
      <ArrowRight className="ml-2 h-4 w-4" />
    </button>
  );
}