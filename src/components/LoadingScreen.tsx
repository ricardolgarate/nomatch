import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    setFadeOut(false);

    // Minimum display time for smooth UX
    const minDisplayTimer = setTimeout(() => {
      // Start fade out animation
      setFadeOut(true);
      
      // Remove loader after fade animation
      const fadeTimer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Fade duration

      return () => clearTimeout(fadeTimer);
    }, 400); // Minimum 400ms display time

    return () => clearTimeout(minDisplayTimer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Logo */}
        <div className="animate-pulse">
          <img 
            src="/logos_Mesa de trabajo 1.jpg" 
            alt="NoMatch Logo" 
            className="w-32 h-32 object-contain mix-blend-multiply"
            style={{ filter: 'brightness(1.1)' }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

