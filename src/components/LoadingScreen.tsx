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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-400 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-hero-radial opacity-50" />
      <div className="relative flex flex-col items-center">
        <img
          src="/BFABLOGO.png"
          alt="Beauty For Ashes Boutique"
          className="w-64 h-auto object-contain animate-pulse"
        />

        <div className="flex justify-center gap-1.5 mt-10">
          <span className="w-1.5 h-1.5 bg-bfab-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-bfab-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-bfab-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
