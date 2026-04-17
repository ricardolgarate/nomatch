import { Link } from 'react-router-dom';
import { Sparkle } from 'lucide-react';

export default function ColorChangingSection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="eyebrow mb-5 inline-flex items-center gap-2">
              <Sparkle className="w-3.5 h-3.5" />
              Made for every size
            </span>

            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-black mt-4 mb-8 leading-[1.05]">
              Style that fits <br />
              <span className="italic text-bfab-600">all of us.</span>
            </h2>

            <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light">
              <p>
                Petite to plus, bold to quiet, brand-new or gently loved — we
                carry pieces for every shape and every vibe.
              </p>
              <p>
                Every budget gets a seat at the table. That is the BFAB promise.
              </p>
            </div>

            <Link to="/shop" className="btn-primary mt-10">
              SHOP THE LOOK
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-soft group">
              <img
                src="https://images.pexels.com/photos/10873719/pexels-photo-10873719.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Diverse model in boutique fashion"
                className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-bfab-600 text-white font-display text-3xl px-8 py-5 rounded-2xl shadow-soft hidden md:block">
              BFAB ✦
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
