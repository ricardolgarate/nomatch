import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    setFadeOut(false);

    const minDisplayTimer = setTimeout(() => {
      setFadeOut(true);
      const fadeTimer = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(fadeTimer);
    }, 400);

    return () => clearTimeout(minDisplayTimer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-hero-radial opacity-70" />
      <div className="relative flex flex-col items-center">
        <div className="w-40 h-40 rounded-full bg-white shadow-soft flex items-center justify-center animate-pulse">
          <img
            src="/BFAB-Logo.jpg"
            alt="Beauty For Ashes Boutique"
            className="w-28 h-auto object-contain"
          />
        </div>

        <div className="flex justify-center gap-1.5 mt-8">
          <span className="w-1.5 h-1.5 bg-bfab-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-bfab-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-bfab-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
