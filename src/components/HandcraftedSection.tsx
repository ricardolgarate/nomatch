import { Link } from 'react-router-dom';

export default function HandcraftedSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute inset-0 bg-hero-radial opacity-60 pointer-events-none" />
      <div className="container relative mx-auto px-6">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-bfab-100 bg-bfab-50/75 p-8 md:p-14 shadow-card text-center">
          <span className="eyebrow mb-5">Curated With Love 💜</span>

          <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-4 mb-8 leading-[1.05] text-balance">
            Pieces chosen for the season you're{' '}
            <span className="italic text-bfab-600">stepping into.</span>
          </h2>

          <div className="mx-auto max-w-3xl space-y-5 text-black/75 text-lg leading-relaxed font-light text-pretty">
            <p>
              Beauty For Ashes Boutique is a small, faith-rooted boutique in Dallas,
              Texas, inspired by Isaiah 61:3: "to give unto them beauty for ashes."
            </p>
            <p>
              Every piece is selected with real life in mind: new arrivals, handpicked
              pre-loved gems, shoes, accessories, giftables, and styles for women,
              men, and kids.
            </p>
            <p className="font-medium text-bfab-800">
              Our heart is simple: help you feel confident, restored, and ready for
              the season you're stepping into.
            </p>
          </div>

          <Link to="/about" className="btn-primary mt-10">
            MEET CATRICE
          </Link>
        </div>
      </div>
    </section>
  );
}
