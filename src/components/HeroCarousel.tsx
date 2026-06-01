import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    eyebrow: 'BEAUTY FOR ASHES BOUTIQUE',
    title: 'Wear Your',
    accent: 'Crown.',
    description:
      'Faith-rooted fashion for every version of you, chosen with confidence and love.',
    image:
      'https://images.pexels.com/photos/8386647/pexels-photo-8386647.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SHOP THE COLLECTION',
    link: '/shop',
  },
  {
    eyebrow: 'NEW ARRIVALS',
    title: 'Soft Power.',
    accent: 'Bold Grace.',
    description:
      'From statement heels to everyday essentials, pieces that feel like yours.',
    image:
      'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'EXPLORE NEW',
    link: '/shop',
  },
  {
    eyebrow: 'SIGNATURE PURPLE',
    title: 'Royalty,',
    accent: 'in every thread.',
    description:
      'Our signature purple palette, styled to feel luxe, never loud.',
    image:
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1920',
    cta: 'SEE THE LOOK',
    link: '/shop/womens-clothing',
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
      className="relative h-[88vh] min-h-[600px] max-h-[840px] overflow-hidden bg-black"
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-bfab-900/55 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5" />
          <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-bfab-500/25 blur-3xl" />

          <div className="relative container mx-auto px-6 h-full flex items-center">
            <div className="max-w-3xl text-white">
              <p
                key={`${i}-${current}-eyebrow`}
                className="text-[11px] tracking-[0.42em] text-bfab-200 mb-6 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                {slide.eyebrow}
              </p>
              <h1
                key={`${i}-${current}-title`}
                className="font-display text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.98] mb-2 animate-fade-in-up"
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
                className="text-lg md:text-xl text-white/85 mb-10 max-w-xl animate-fade-in-up font-light leading-relaxed"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Link
                  key={`${i}-${current}-cta`}
                  to={slide.link}
                  className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-9 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg transition-all duration-500 hover:bg-bfab-200"
                >
                  {slide.cta}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 px-9 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-black"
                >
                  Our Story
                </Link>
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
