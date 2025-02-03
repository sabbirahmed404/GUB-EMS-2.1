import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withLink?: boolean;
}

export default function Logo({ className = '', size = 'md', withLink = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const logoElement = (
    <img 
      src="/Assets/Primary_logo.svg" 
      alt="GUB-EMS Logo" 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );

  if (!withLink) {
    return logoElement;
  }

  return (
    <Link to="/" className="flex items-center space-x-3">
      {logoElement}
    </Link>
  );
}