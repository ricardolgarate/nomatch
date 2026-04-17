import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    eyebrow: 'BEAUTY FOR ASHES BOUTIQUE',
    title: 'Wear Your',
    accent: 'Crown.',
    description:
      'A little boutique in Desoto, Texas, for every woman — every shape, every shade, every story.',
    image:
      'https://images.pexels.com/photos/8386647/pexels-photo-8386647.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SHOP THE COLLECTION',
    link: '/shop',
  },
  {
    eyebrow: 'FOR ALL SIZES',
    title: 'Made for',
    accent: 'all of us.',
    description:
      'New and gently worn pieces curated with love — sized for everybody, priced for every budget.',
    image:
      'https://images.pexels.com/photos/10873719/pexels-photo-10873719.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SHOP NEW',
    link: '/shop',
  },
  {
    eyebrow: 'GIFTS & STYLING',
    title: 'Find your',
    accent: 'next favorite.',
    description:
      'Clothing, shoes, accessories and giftables — hand-picked by Catrice, our founder and stylist.',
    image:
      'https://images.pexels.com/photos/5704720/pexels-photo-5704720.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SEE WHAT IS NEW',
    link: '/shop/clothing',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (dir: 1 | -1) => {
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  return (
    <section
      className="relative h-[88vh] min-h-[560px] max-h-[820px] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
              i === current ? 'scale-105' : 'scale-100'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative container mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <p
                key={`${i}-${current}-eyebrow`}
                className="text-[11px] tracking-[0.5em] text-white/80 mb-6 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {slide.eyebrow}
              </p>
              <h1
                key={`${i}-${current}-title`}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-2 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                {slide.title}
              </h1>
              <h2
                key={`${i}-${current}-accent`}
                className="font-display italic text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-8 text-bfab-200 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                {slide.accent}
              </h2>
              <p
                key={`${i}-${current}-desc`}
                className="text-lg md:text-xl text-white/85 mb-10 max-w-xl animate-fade-in-up font-light"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
              <Link
                key={`${i}-${current}-cta`}
                to={slide.link}
                className="inline-flex items-center gap-3 px-9 py-4 bg-white text-black hover:bg-bfab-600 hover:text-white transition-all duration-500 tracking-[0.2em] text-xs font-semibold rounded-md shadow-lg animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                {slide.cta}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(-1)}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              i === current ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
