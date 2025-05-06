import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, ExternalLink, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Logo and Description */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center">
              <span className="text-3xl font-bold mr-1">GUB</span>
              <div className="flex items-center">
                <span className="text-accent font-extrabold text-3xl">-</span>
                <span className="text-accent font-extrabold text-3xl">EMS</span>
              </div>
            </Link>
            <p className="text-white/80 mt-4 text-sm">
              A comprehensive event management system for Green University, designed to streamline event planning, 
              organization, and participation for students and faculty.
            </p>
            <div className="flex space-x-4 pt-4">
              <SocialLink href="https://facebook.com" icon={<Facebook className="h-5 w-5" />} />
              <SocialLink href="https://twitter.com" icon={<Twitter className="h-5 w-5" />} />
              <SocialLink href="https://instagram.com" icon={<Instagram className="h-5 w-5" />} />
              <SocialLink href="https://github.com" icon={<Github className="h-5 w-5" />} />
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/events">Events</FooterLink>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="/help">Help Center</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div className="md:col-span-4">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-accent mt-0.5" />
                <p className="text-white/80 text-sm">
                  American Purbachal City, Rupganj, Narayanganj, <br />
                  Dhaka, Bangladesh
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-accent" />
                <span className="text-white/80 text-sm">+880 1234 567890</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-accent" />
                <span className="text-white/80 text-sm">contact@gub-ems.com</span>
              </div>
              <a 
                href="https://green.edu.bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-white/80 hover:text-accent transition-colors text-sm"
              >
                <span>Visit Official GUB Website</span>
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            © {currentYear} GUB-EMS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-white/70 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="/cookies" className="text-white/70 hover:text-white text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="bg-white/10 p-2 rounded-full hover:bg-accent/20 hover:text-accent transition-all"
    >
      {icon}
    </a>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link 
        to={to} 
        className="text-white/80 hover:text-accent transition-colors text-sm inline-block"
      >
        {children}
      </Link>
    </li>
  );
}