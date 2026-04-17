import { Link } from 'react-router-dom';

export default function HandcraftedSection() {
  return (
    <section className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-70 pointer-events-none" />

      <div className="container mx-auto px-6 text-center max-w-3xl relative">
        <span className="eyebrow mb-5">The BFAB Difference</span>

        <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-4 mb-8 leading-[1.1] text-balance">
          Dressed to feel{' '}
          <span className="italic text-bfab-600">like you.</span>
        </h2>

        <div className="divider-ornament mb-10">
          <span className="text-2xl">✦</span>
        </div>

        <div className="space-y-6 text-black/75 text-lg md:text-xl leading-relaxed font-light text-pretty">
          <p>
            You know that outfit. The one that makes you stand taller. That
            makes people ask where you got it. BFAB is where those outfits live.
          </p>

          <p>
            Every piece is hand-picked by{' '}
            <span className="font-medium text-bfab-700">Catrice</span> — a
            stylist with 20 years in fashion retail. So you skip the guesswork
            and go straight to pieces that fit, feel great, and look like you.
          </p>

          <p className="italic text-bfab-700">
            Come as you are. Leave feeling like a queen.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link to="/shop" className="btn-primary">
            SHOP NEW ARRIVALS
          </Link>
          <Link to="/about" className="btn-ghost">
            MEET CATRICE →
          </Link>
        </div>
      </div>
    </section>
  );
}
