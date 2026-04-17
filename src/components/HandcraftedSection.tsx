import { Link } from 'react-router-dom';

export default function HandcraftedSection() {
  return (
    <section className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-radial opacity-70 pointer-events-none" />

      <div className="container mx-auto px-6 text-center max-w-3xl relative">
        <span className="eyebrow mb-5">Curated With Love</span>

        <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-4 mb-8 leading-[1.1] text-balance">
          Designed to be{' '}
          <span className="italic text-bfab-600">different.</span>
        </h2>

        <div className="divider-ornament mb-10">
          <span className="text-2xl">✦</span>
        </div>

        <div className="space-y-6 text-black/75 text-lg md:text-xl leading-relaxed font-light text-pretty">
          <p>
            At <span className="font-medium text-bfab-700">Beauty For Ashes Boutique</span>,
            we believe confidence comes from embracing what makes you different. Every piece
            is chosen to remind you that you don't have to fit a certain mold to stand out.
          </p>

          <p>
            From statement shoes to everyday essentials, our collection is curated to turn
            heads while feeling completely you.
          </p>
        </div>

        <Link to="/about" className="btn-primary mt-12">
          OUR STORY
        </Link>
      </div>
    </section>
  );
}
