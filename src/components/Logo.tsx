import { Link } from 'react-router-dom';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/Assets/Primary_logo.svg" 
        alt="GUB-EMS Logo" 
        className="h-9 w-auto"
      />
    </Link>
  );
}