import { Link } from 'react-router-dom';
export default function ColorChangingSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center rounded-[2rem] bg-bfab-50/70 border border-bfab-100 p-6 md:p-10 shadow-card">
          <div className="order-2 lg:order-1">
            <span className="eyebrow mb-5">
              Style That Feels Like You
            </span>

            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-black mt-4 mb-8 leading-[1.05]">
              Confidence for <br />
              <span className="italic text-bfab-600">every day.</span>
            </h2>

            <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light">
              <p>
                From bold accents to simple everyday staples, every piece is chosen
                to help you feel pulled together without trying too hard.
              </p>
              <p>
                Shop small drops, gently loved gems, and easy pieces you can
                wear to brunch, church, date night, errands, or wherever life takes you.
              </p>
            </div>

            <Link to="/shop" className="btn-primary mt-10">
              SHOP NOW
            </Link>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] rounded-[1.75rem] overflow-hidden shadow-soft group border border-white">
              <img
                src="/93BF818E-D0C2-400B-82F5-5F6C9480C7E3.png"
                alt="Confident everyday style"
                className="w-full h-full object-cover object-top transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
