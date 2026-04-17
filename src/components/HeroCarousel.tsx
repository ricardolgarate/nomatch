import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    eyebrow: 'NEW ARRIVALS · STYLED TO TURN HEADS',
    title: 'Your next',
    accent: 'favorite outfit.',
    description:
      'Step into the boutique and walk out feeling beautiful. Hand-picked new and gently worn pieces for every shape, every shade, every story.',
    image:
      'https://images.pexels.com/photos/8386647/pexels-photo-8386647.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SHOP NEW ARRIVALS',
    link: '/shop',
  },
  {
    eyebrow: 'SIZED FOR EVERY BODY',
    title: 'Finally, a boutique',
    accent: 'made for you.',
    description:
      'XS to plus. Dressy to casual. Real pieces at real prices — picked by a stylist with 20 years in fashion retail.',
    image:
      'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'FIND YOUR FIT',
    link: '/shop',
  },
  {
    eyebrow: 'HAND-PICKED BY CATRICE',
    title: 'Get the look',
    accent: 'without the hunt.',
    description:
      'Skip the endless scroll. Every piece in the boutique is curated for you — so you can open the door, find your favorite, and go.',
    image:
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SHOP THE LOOK',
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
                className="text-lg md:text-xl text-white/85 mb-6 max-w-xl animate-fade-in-up font-light"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
              <div
                className="flex flex-wrap items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <Link
                  key={`${i}-${current}-cta`}
                  to={slide.link}
                  className="inline-flex items-center gap-3 px-9 py-4 bg-white text-black hover:bg-bfab-600 hover:text-white transition-all duration-500 tracking-[0.2em] text-xs font-semibold rounded-md shadow-lg"
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <span className="text-xs tracking-[0.2em] uppercase text-white/70">
                  Free shipping over $150 · Easy 10-day returns
                </span>
              </div>
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
