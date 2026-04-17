import { Link } from 'react-router-dom';

export default function HandcraftedSection() {
  return (
    <section className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-70 pointer-events-none" />

      <div className="container mx-auto px-6 text-center max-w-3xl relative">
        <span className="eyebrow mb-5">A Note From The Founder</span>

        <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-4 mb-8 leading-[1.1] text-balance">
          A little boutique,{' '}
          <span className="italic text-bfab-600">big heart.</span>
        </h2>

        <div className="divider-ornament mb-10">
          <span className="text-2xl">✦</span>
        </div>

        <div className="space-y-6 text-black/75 text-lg md:text-xl leading-relaxed font-light text-pretty">
          <p>
            Hi, I am <span className="font-medium text-bfab-700">Catrice</span>.
            I opened Beauty For Ashes Boutique in Desoto, Texas, because every
            woman deserves to feel beautiful — no matter her size, her shade, or
            her budget.
          </p>

          <p>
            Here you will find new and gently worn pieces. Shoes. Clothing.
            Accessories. Little gifts for you and the people you love. Hand-picked
            with care and styled with love.
          </p>

          <p>
            Come in as you are. Leave feeling like a queen.
          </p>
        </div>

        <Link to="/about" className="btn-primary mt-12">
          OUR STORY
        </Link>
      </div>
    </section>
  );
}
