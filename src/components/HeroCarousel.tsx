import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
  return (
    <section className="relative h-[88vh] min-h-[600px] max-h-[840px] overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: 'url(/C9C4974B-357B-4D8E-9F48-3C9E3501BEA4.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-bfab-900/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5" />
      <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-bfab-500/25 blur-3xl" />

      <div className="relative container mx-auto px-6 h-full flex items-center">
        <div className="max-w-3xl text-white">
          <p
            className="text-[11px] tracking-[0.42em] text-bfab-200 mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            BEAUTY FOR ASHES BOUTIQUE
          </p>
          <h1
            className="font-display text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.98] mb-2 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Wear Your
          </h1>
          <h2
            className="font-display italic text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-8 text-bfab-200 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Crown.
          </h2>
          <p
            className="text-lg md:text-xl text-white/85 mb-10 max-w-xl animate-fade-in-up font-light leading-relaxed"
            style={{ animationDelay: '0.4s' }}
          >
            Faith-rooted fashion for every version of you, chosen with confidence and love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-3 rounded-md bg-white px-9 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg transition-all duration-500 hover:bg-bfab-200"
            >
              SHOP THE COLLECTION
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
    </section>
  );
}
