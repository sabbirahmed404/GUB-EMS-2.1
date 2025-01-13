import { Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Description */}
        <div>
          <h3 className="text-xl font-semibold mb-4">About GUB-EMS</h3>
          <p>
            This is a system for Green University. A student-led project whose purpose is to eradicate the problems faced when organizing and involving in events.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact</h3>
          <div className="flex space-x-4 mb-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook className="h-6 w-6 hover:text-accent transition-colors" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-6 w-6 hover:text-accent transition-colors" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Instagram className="h-6 w-6 hover:text-accent transition-colors" />
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6" />
            <span>contact@gub-ems.com</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <MapPin className="h-6 w-6" />
            <span>+880 1234 567890</span>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Location</h3>
          <p>
            American Purbachal City, Rupganj, Narayanganj, Dhaka, Bangladesh.
          </p>
        </div>
      </div>
    </footer>
  );
}