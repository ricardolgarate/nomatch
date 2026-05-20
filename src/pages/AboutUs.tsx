import { Link } from 'react-router-dom';
import { Heart, Sparkles, MapPin } from 'lucide-react';

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
          <p className="text-white/85 mt-6 max-w-lg text-lg font-light">
            A Dallas boutique rooted in faith, restoration, and confidence.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-bfab-200/90 text-xs tracking-[0.3em] uppercase">
            <MapPin className="w-3.5 h-3.5" />
            Dallas, Texas
          </div>
        </div>
      </div>

      {/* Meet Catrice */}
      <section className="bg-white py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="A thoughtfully curated shop"
                className="rounded-2xl shadow-soft w-full h-auto"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="eyebrow mb-4">Meet the Founder</span>
              <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
                Hi, I'm <span className="italic text-bfab-600">Catrice.</span>
              </h2>
              <div className="space-y-5 text-black/80 text-lg leading-relaxed font-light text-pretty">
                <p>
                  BFAB was created from my love for fashion, confidence, and helping people
                  feel good about themselves without breaking the bank.
                </p>
                <p>
                  What started as a vision became a boutique focused on stylish, affordable
                  pieces for women, men, and kids. I personally curate items that are trendy,
                  versatile, and easy to wear.
                </p>
                <p>
                  Whether you're dressing up for a night out, heading to brunch, or just
                  wanting to feel your best every day, I want BFAB to be a place where you
                  can find something that feels like you.
                </p>
                <p>
                  As a small boutique based in Dallas, every order, share, and purchase truly
                  means the world to me. Thank you for supporting my dream and shopping with
                  BFAB!
                </p>
              </div>
              <p className="mt-8 text-sm tracking-[0.2em] uppercase text-black/50">
                Catrice Hines, Founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll find */}
      <section className="bg-bfab-50/60 py-24 md:py-32 border-y border-black/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="eyebrow mb-4">The Boutique</span>
            <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-6 leading-[1.05]">
              Fashion for every <span className="italic text-bfab-600">version of you.</span>
            </h2>
            <p className="text-black/75 text-lg font-light text-pretty">
              Modern, wearable pieces for real life, real confidence, and real budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <Sparkles className="w-8 h-8 text-bfab-600 mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-2xl text-black mb-2">New Arrivals</h3>
              <p className="text-black/70 text-sm leading-relaxed">
                Fresh pieces we can't wait to show you, chosen one by one.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <Heart className="w-8 h-8 text-bfab-600 mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-2xl text-black mb-2">Curated Pre-Loved Gems</h3>
              <p className="text-black/70 text-sm leading-relaxed">
                Carefully chosen finds with plenty of style and a smaller price.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-card">
              <MapPin className="w-8 h-8 text-bfab-600 mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-2xl text-black mb-2">Family &amp; Gift Finds</h3>
              <p className="text-black/70 text-sm leading-relaxed">
                Shoes, accessories, kids pieces, men's finds, and little giftables that feel special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-24 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="eyebrow mb-4">Our Story</span>
            <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
              Beauty from <span className="italic text-bfab-600">ashes.</span>
            </h2>
            <div className="space-y-5 text-black/80 text-lg leading-relaxed font-light text-pretty">
              <p>
                Beauty For Ashes Boutique is inspired by Isaiah 61:3, a message
                of restoration, hope, and new beginnings.
              </p>
              <p>
                BFAB was created to reflect that transformation, turning life's
                difficult seasons into confidence, beauty, and renewed identity.
                Fashion here is more than clothing. It is a reminder that what
                you wear can reflect who you are becoming.
              </p>
              <p>
                We curate stylish, wearable pieces for women, men, and kids that
                fit real life, from everyday looks to standout moments. Our
                mission is simple: help you feel confident in every season you
                step into.
              </p>
              <p className="font-medium text-bfab-700">
                At BFAB, style is not just what you wear. It is how you rise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Name */}
      <section className="bg-bfab-50/60 py-24 md:py-28 border-y border-black/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="eyebrow mb-4">Our Name</span>
            <h2 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-8 leading-[1.05]">
              Beauty For <span className="italic text-bfab-600">Ashes.</span>
            </h2>
            <div className="divider-ornament mb-10">
              <span className="text-2xl">✦</span>
            </div>
            <div className="space-y-5 text-black/80 text-lg leading-relaxed font-light text-pretty">
              <p>
                Our name, Beauty For Ashes Boutique, is inspired by Isaiah 61:3,
                a scripture that speaks of restoration, healing, and new beginnings:
              </p>
              <p>
                "To give unto them beauty for ashes..."
              </p>
              <p>
                This verse reflects the heart of our brand and our love for the Lord
                Jesus Christ. It reminds us that even after loss, struggle, or change,
                there is still purpose, confidence, and beauty to be found again.
              </p>
              <p>
                At BFAB, fashion is more than clothing. It is expression, renewal,
                and confidence. Every piece is chosen to help you step into your next
                season looking and feeling like your best self, bold, restored, and
                beautifully made new.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial opacity-60" />
        <div className="container mx-auto px-6 text-center relative">
          <h3 className="font-display text-4xl md:text-5xl font-medium mb-6 leading-tight">
            Ready to wear your <span className="italic text-bfab-200">crown?</span>
          </h3>
          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto font-light">
            Come shop the boutique. We're grateful you're here.
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
