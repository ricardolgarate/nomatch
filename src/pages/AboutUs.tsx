import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[70vh] min-h-[480px] bg-black overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="text-[11px] tracking-[0.5em] uppercase mb-5 text-bfab-200">
            Our Story
          </span>
          <h1 className="font-display text-6xl md:text-8xl font-light tracking-tight">
            About <span className="italic text-bfab-200">Us</span>
          </h1>
          <p className="text-white/80 mt-6 max-w-lg text-lg font-light">
            A little boutique with big ideas — for the woman who was always meant to stand out.
          </p>
        </div>
      </div>

      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Beauty For Ashes Boutique community"
                className="rounded-2xl shadow-soft w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="eyebrow mb-4">Our Brand</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
                Quiet luxury, <span className="italic text-bfab-600">loud confidence.</span>
              </h2>
              <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light text-pretty">
                <p>
                  We believe confidence comes from embracing what makes you different. Our pieces
                  aren't made to blend in — they're made to remind you that you don't have to fit
                  a certain mold to stand out.
                </p>
                <p>
                  At <span className="font-medium text-bfab-700">Beauty For Ashes Boutique</span>,
                  we curate pieces that look as unique as the people who wear them. Every drop is
                  chosen with intention — a little twist that makes every outfit more fun to wear
                  and style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bfab-50/60 py-24 md:py-32 border-y border-black/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="eyebrow mb-4">Our Process</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
                Curated with <span className="italic text-bfab-600">intention.</span>
              </h2>
              <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light text-pretty">
                <p>
                  Beauty For Ashes Boutique didn't happen overnight — it took years of curating,
                  sourcing, and refining to land on a collection we'd actually want to wear every
                  day.
                </p>
                <p>
                  Every drop is{' '}
                  <span className="font-medium text-bfab-700">hand-picked in small batches</span>,
                  with an eye for quality, fit, and the details that make a look feel finished.
                </p>
                <p>
                  From first impression to final packaging, we've obsessed over the experience —
                  because when you open a BFAB piece, we want it to feel just as intentional as
                  putting it on.
                </p>
              </div>
              <Link to="/shop" className="btn-primary mt-10">
                SHOP THE COLLECTION
              </Link>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Beauty For Ashes Boutique styling"
                className="rounded-2xl shadow-soft w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial opacity-60" />
        <div className="container mx-auto px-6 text-center relative">
          <h3 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">
            Ready to stand <span className="italic text-bfab-200">out?</span>
          </h3>
          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto font-light">
            Join the Beauty For Ashes Boutique community and discover pieces that celebrate what
            makes you unique.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black hover:bg-bfab-200 transition-all duration-500 tracking-[0.2em] text-xs font-semibold rounded-md shadow-lg"
          >
            EXPLORE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}
