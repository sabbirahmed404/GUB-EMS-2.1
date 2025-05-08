import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { BsApple, BsMicrosoft } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch images from storage bucket
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('event-images')
          .list();

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        // Filter for image files
        const imageFiles = data
          .filter(file => file.name.match(/\.(jpeg|jpg|png|webp)$/i))
          .map(file => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/event-images/${file.name}`);

        if (imageFiles.length > 0) {
          setImageUrls(imageFiles);
        } else {
          // Fallback image URLs if no images in bucket
          setImageUrls([
            '/Assets/event-image/carnival.jpg',
            '/Assets/event-image/carnival-2.jpg',
            '/Assets/event-image/carnival-3.jpg',
            '/Assets/event-image/noboborsho.jpg',
          ]);
        }
      } catch (err) {
        console.error('Error in image fetching:', err);
        // Fallback image URLs
        setImageUrls([
          '/Assets/event-image/carnival.jpg',
          '/Assets/event-image/carnival-2.jpg',
          '/Assets/event-image/carnival-3.jpg',
          '/Assets/event-image/noboborsho.jpg',
        ]);
      }
    };

    fetchImages();
  }, []);

  // Image rotation logic
  useEffect(() => {
    if (imageUrls.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [imageUrls]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {imageUrls.length > 0 && (
          <>
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
              style={{ 
                backgroundImage: `url(${imageUrls[currentImageIndex]})`,
                opacity: 0.9
              }}
            />
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-12 text-white z-20">
              <h1 className="text-4xl font-bold mb-4">GUB Event Management</h1>
              <p className="text-xl max-w-md mb-8">
                Manage, participate, and organize events with a seamless experience
              </p>
              <div className="flex space-x-2 mb-10">
                {imageUrls.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "w-10 bg-white" : "w-3 bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Side - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-6 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
              variant="outline"
            >
              <FcGoogle className="w-5 h-5" />
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </Button>

            <Button
              disabled={true}
              className="w-full py-6 bg-white text-gray-400 border border-gray-200 flex items-center justify-center gap-3 cursor-not-allowed"
              variant="outline"
            >
              <BsApple className="w-5 h-5" />
              <span>Continue with Apple</span>
            </Button>

            <Button
              disabled={true}
              className="w-full py-6 bg-white text-gray-400 border border-gray-200 flex items-center justify-center gap-3 cursor-not-allowed"
              variant="outline"
            >
              <BsMicrosoft className="w-5 h-5" />
              <span>Continue with Microsoft</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 