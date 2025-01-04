import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-3">
      <img
        src="https://ibb.co.com/zf2FWDc"
        alt="GUB-EMS Logo"
        className="h-9 w-9" // Adjust sizing as needed
      />
      <span className="font-bold text-xl text-white">GUB-EMS</span>
    </Link>
  );
}
