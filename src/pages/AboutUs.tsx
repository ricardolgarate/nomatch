import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Heart } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[70vh] min-h-[480px] bg-black overflow-hidden">
        <img
          src="https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Woman shopping for clothes in a boutique"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="text-[11px] tracking-[0.5em] uppercase mb-5 text-bfab-200">
            Our Story
          </span>
          <h1 className="font-display text-6xl md:text-8xl font-light tracking-tight">
            Meet <span className="italic text-bfab-200">BFAB</span>
          </h1>
          <p className="text-white/80 mt-6 max-w-lg text-lg font-light">
            A little boutique with a big heart, right here in Desoto, Texas.
          </p>
        </div>
      </div>

      {/* Promise band */}
      <section className="bg-bfab-50/60 border-b border-black/5 py-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-display text-3xl text-bfab-600">20+ yrs</p>
              <p className="text-sm text-black/70 font-light">Fashion retail experience</p>
            </div>
            <div>
              <p className="font-display text-3xl text-bfab-600">XS – Plus</p>
              <p className="text-sm text-black/70 font-light">Curated for every body</p>
            </div>
            <div>
              <p className="font-display text-3xl text-bfab-600">10-day returns</p>
              <p className="text-sm text-black/70 font-light">Love it or send it back</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catrice's story */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/8386647/pexels-photo-8386647.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Styling a piece at BFAB"
                className="rounded-2xl shadow-soft w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="eyebrow mb-4">Meet Catrice</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
                Hi, I'm{' '}
                <span className="italic text-bfab-600">Catrice Hines.</span>
              </h2>
              <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light text-pretty">
                <p>
                  I am the founder of Beauty For Ashes Boutique. I live and love
                  fashion. I have for as long as I can remember.
                </p>
                <p>
                  I studied Fashion Marketing at the University of North Texas. I
                  earned my BBA. Then I spent 20 years in retail learning every
                  side of the business.
                </p>
                <p>
                  I have worked at luxury stores. I have worked at non-profit
                  stores. I have done sales, jewelry, sportswear, fragrance and
                  cosmetics. I have been a personal shopper and a stylist. I have
                  managed departments and whole stores.
                </p>
                <p>
                  Through it all, one thing never changed. I love helping women
                  feel good in what they wear.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-up values */}
      <section className="bg-bfab-50/60 py-20 md:py-24 border-y border-black/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="eyebrow mb-4">What we believe</span>
            <h2 className="font-display text-4xl md:text-5xl font-medium text-black mt-3 leading-tight">
              The BFAB <span className="italic text-bfab-600">promise.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-card">
              <div className="w-12 h-12 rounded-full bg-bfab-50 flex items-center justify-center mb-5">
                <Heart className="w-5 h-5 text-bfab-600" strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl text-black mb-2">
                For every woman
              </h3>
              <p className="text-black/70 text-sm font-light leading-relaxed">
                Every size. Every shade. Every body. When you walk in, you belong.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-card">
              <div className="w-12 h-12 rounded-full bg-bfab-50 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-bfab-600" strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl text-black mb-2">
                New or gently worn
              </h3>
              <p className="text-black/70 text-sm font-light leading-relaxed">
                We stock both. New pieces for fresh style. Gently worn pieces for
                smart style. Both are hand-picked.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-card">
              <div className="w-12 h-12 rounded-full bg-bfab-50 flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 text-bfab-600" strokeWidth={1.6} />
              </div>
              <h3 className="font-display text-xl text-black mb-2">Made in Desoto</h3>
              <p className="text-black/70 text-sm font-light leading-relaxed">
                We are a small business in Desoto, Texas. When you shop BFAB,
                you support a local dream.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we carry */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <span className="eyebrow mb-4">What you'll find</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
                A little of <span className="italic text-bfab-600">everything.</span>
              </h2>
              <div className="space-y-5 text-black/75 text-lg leading-relaxed font-light text-pretty">
                <p>
                  Clothing for every size. Shoes. Accessories. Little gifts
                  you'll want to keep for yourself.
                </p>
                <p>
                  Some pieces are brand new. Some are{' '}
                  <span className="font-medium text-bfab-700">
                    very gently worn
                  </span>
                  . All of them are chosen with care.
                </p>
                <p>
                  Any budget. Any lifestyle. Any mood. You'll find something
                  here that feels like you.
                </p>
              </div>
              <Link to="/shop" className="btn-primary mt-10">
                SHOP THE BOUTIQUE
              </Link>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/5704720/pexels-photo-5704720.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Diverse woman styling her outfit"
                className="rounded-2xl shadow-soft w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial opacity-60" />
        <div className="container mx-auto px-6 text-center relative">
          <h3 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">
            Come as you are. <br />
            Leave feeling like{' '}
            <span className="italic text-bfab-200">a queen.</span>
          </h3>
          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto font-light">
            Welcome to the BFAB family.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black hover:bg-bfab-200 transition-all duration-500 tracking-[0.2em] text-xs font-semibold rounded-md shadow-lg"
          >
            EXPLORE THE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}
