import { Link } from 'react-router-dom';
import { BookOpen, Gift, Heart, MapPin, ShoppingBag, Sparkles } from 'lucide-react';

const boutiqueHighlights = [
  {
    icon: ShoppingBag,
    title: 'Wearable Style',
    copy: 'Trendy, versatile pieces for women, men, and kids. Easy to dress up, easy to wear every day.',
  },
  {
    icon: Heart,
    title: 'Pre-Loved Finds',
    copy: 'Curated pre-loved gems selected with care, style, and budget in mind.',
  },
  {
    icon: Gift,
    title: 'Little Giftables',
    copy: 'Accessories, special extras, and thoughtful finds that make shopping feel personal.',
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#fbf8ff] text-black">
      <section className="relative overflow-hidden border-b border-bfab-100 bg-gradient-to-br from-white via-bfab-50 to-bfab-100/70">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-bfab-200/60 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-bfab-300/40 blur-3xl" />

        <div className="container relative mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-white/60 shadow-soft" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white shadow-card bg-white">
                <img
                  src="/catrice-founder.png"
                  alt="Catrice, founder of Beauty For Ashes Boutique"
                  className="aspect-[4/5] w-full object-cover object-left"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl bg-white/95 px-6 py-4 shadow-soft border border-bfab-100">
                <p className="text-[10px] tracking-[0.3em] uppercase text-bfab-700 font-semibold">
                  Catrice Hines, Founder
                </p>
                <p className="mt-1 text-sm text-black/65">
                  Curating BFAB with faith, joy, and a whole lot of love.
                </p>
              </div>
            </div>

            <div className="pt-6 lg:pt-0">
              <span className="eyebrow mb-5">Meet the Founder</span>
              <h1 className="font-display text-5xl md:text-7xl font-medium leading-[1.02] text-black">
                Hi, I'm <span className="italic text-bfab-600">Catrice.</span>
              </h1>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-black/75 font-light text-pretty">
                <p>
                  BFAB was created from my love for fashion, confidence, and helping
                  people feel good about themselves without breaking the bank.
                </p>
                <p>
                  What started as a vision became a boutique focused on stylish,
                  affordable pieces for women, men, and kids. I personally curate
                  items that are trendy, versatile, and easy to wear.
                </p>
                <p>
                  Whether you're dressing up for a night out, heading to brunch, or
                  just wanting to feel your best every day, I want BFAB to feel like
                  a place where you can find something that feels like you.
                </p>
                <p className="font-medium text-bfab-800">
                  Every order, share, and purchase means the world to me. Thank you
                  for supporting my dream and shopping with BFAB!
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/shop" className="btn-primary">
                  Shop the Boutique
                </Link>
                <span className="inline-flex items-center gap-2 text-sm text-black/55">
                  <MapPin className="h-4 w-4 text-bfab-600" />
                  Dallas, Texas
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-stretch">
            <div className="rounded-[1.75rem] bg-bfab-900 p-8 md:p-10 text-white shadow-soft flex flex-col justify-between">
              <div>
                <BookOpen className="h-9 w-9 text-bfab-200 mb-6" strokeWidth={1.5} />
                <p className="text-[11px] tracking-[0.35em] uppercase text-bfab-200 font-semibold mb-4">
                  Isaiah 61:3
                </p>
                <p className="font-display text-4xl md:text-5xl leading-tight">
                  "To give unto them beauty for ashes..."
                </p>
              </div>
              <p className="mt-10 text-sm leading-relaxed text-white/70">
                This scripture is the heart behind our name, Beauty For Ashes
                Boutique. It speaks to restoration, healing, and new beginnings
                through the goodness of our Lord Jesus Christ.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-bfab-100 bg-bfab-50/80 p-8 md:p-10 shadow-card">
              <span className="eyebrow mb-4">Our Story</span>
              <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight mb-6">
                Fashion for every <span className="italic text-bfab-600">version of you.</span>
              </h2>
              <div className="space-y-5 text-black/75 leading-relaxed font-light text-lg">
                <p>
                  BFAB reflects transformation. Life can bring loss, change, and
                  hard seasons, but God still brings purpose, confidence, and beauty
                  from it all.
                </p>
                <p>
                  Fashion here is more than clothing. It is expression, renewal, and
                  a reminder that what you wear can reflect who you are becoming.
                </p>
                <p>
                  We curate pieces that fit real life, from everyday looks to standout
                  moments, so you can step into your next season feeling bold,
                  restored, and beautifully made new.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bfab-50/70 py-20 md:py-24 border-y border-bfab-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="eyebrow mb-4">Inside the Boutique</span>
            <h2 className="font-display text-4xl md:text-6xl font-medium leading-tight">
              Curated with <span className="italic text-bfab-600">care.</span>
            </h2>
            <p className="mt-5 text-black/65 text-lg font-light">
              Stylish, wearable finds for real life, real confidence, and real budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {boutiqueHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-7 md:p-8 shadow-card border border-white hover:shadow-cardHover transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-bfab-50 flex items-center justify-center mb-5">
                  <item.icon className="h-5 w-5 text-bfab-600" strokeWidth={1.7} />
                </div>
                <h3 className="font-display text-2xl text-black mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-black/65 font-light">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 md:py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-black px-8 py-14 md:px-14 md:py-16 text-center text-white shadow-soft">
            <div className="absolute inset-0 bg-hero-radial opacity-70" />
            <Sparkles className="relative mx-auto mb-5 h-8 w-8 text-bfab-200" strokeWidth={1.5} />
            <h2 className="relative font-display text-4xl md:text-6xl font-medium leading-tight">
              At BFAB, style is how you <span className="italic text-bfab-200">rise.</span>
            </h2>
            <p className="relative mt-5 max-w-2xl mx-auto text-white/75 font-light leading-relaxed">
              Thank you for being here, for supporting this dream, and for letting
              BFAB be part of the season God has you walking into.
            </p>
            <div className="relative mt-9 flex justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-md bg-white px-9 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-lg transition-all duration-300 hover:bg-bfab-200"
              >
                Explore the Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
