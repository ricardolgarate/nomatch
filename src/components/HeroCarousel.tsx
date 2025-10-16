import { useState } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: 'One Pair.',
    subtitle: 'Two Designs.',
    description: 'Because being unique is always in style.',
    image: 'https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <section className="relative h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${slide.image})`,
            }}
          />

          <div className="relative container mx-auto px-6 h-full flex items-center">
            <div className="max-w-xl text-white">
              <h2 className="text-6xl font-serif font-light mb-2 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {slide.title}
              </h2>
              <h3 className="text-6xl font-serif font-light mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {slide.subtitle}
              </h3>
              <p className="text-xl mb-8 font-light animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {slide.description}
              </p>
              <Link 
                to="/shop"
                className="inline-block px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 tracking-wider text-sm font-medium transform hover:scale-105 active:scale-95 animate-fade-in-up" 
                style={{ animationDelay: '0.4s' }}
              >
                DISCOVER MORE
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
