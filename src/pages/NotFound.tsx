import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-9xl font-bold text-gray-300">404</div>
      <h1 className="text-2xl md:text-4xl font-bold mt-4 mb-2 text-gray-800">Page Not Found</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
        >
          Go Back
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="default"
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
} 