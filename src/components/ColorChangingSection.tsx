import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const highlights = [
  'XS to plus, thoughtfully fit',
  'New and gently worn — always good',
  'Pieces that work with what you already own',
  'Price points for every budget',
];

export default function ColorChangingSection() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="eyebrow mb-5">Fashion without the guesswork</span>

            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-black mt-4 mb-8 leading-[1.05]">
              Style that fits <br />
              <span className="italic text-bfab-600">all of us.</span>
            </h2>

            <p className="text-black/75 text-lg leading-relaxed font-light mb-6">
              You shouldn't have to choose between feeling beautiful and staying
              on budget. At BFAB, you get both.
            </p>

            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-black/80">
                  <span className="mt-1 w-6 h-6 rounded-full bg-bfab-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-bfab-600" strokeWidth={2.5} />
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/shop" className="btn-primary">
              SHOP YOUR SIZE
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
