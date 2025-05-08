import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';

export default function ComingSoon() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-6" 
          style={{ color: colors.primary }}
        >
          Coming Soon
        </h1>
        <div 
          className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.lightest }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.tertiary }}
          >
            <span className="text-white text-3xl font-bold">!</span>
          </div>
        </div>
        <p 
          className="text-xl mb-8"
          style={{ color: colors.secondary }}
        >
          We're working on something awesome. This feature will be available soon!
        </p>
        <p 
          className="mb-10 text-gray-600"
        >
          Thank you for your patience while we build this page. Please check back later.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-md"
          style={{ 
            backgroundColor: colors.primary,
            color: 'white'
          }}
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
} 