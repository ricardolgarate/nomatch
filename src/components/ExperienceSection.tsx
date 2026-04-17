import { PackageOpen, MessageCircle, Sparkles, RefreshCcw } from 'lucide-react';

const features = [
  {
    icon: PackageOpen,
    title: 'Arrives ready to wear',
    description:
      'Ships in 1–2 business days and lands at your door beautifully packed. Free over $150.',
  },
  {
    icon: RefreshCcw,
    title: 'Love it or send it back',
    description:
      'Easy 10-day returns. No stress, no questions — just style that actually fits you.',
  },
  {
    icon: MessageCircle,
    title: 'A stylist in your pocket',
    description:
      'Have an event? Text us what you need styled. Catrice will pull it together for you.',
  },
  {
    icon: Sparkles,
    title: 'Hand-picked every piece',
    description:
      'No guesswork. Every item is chosen by a stylist with 20 years in luxury fashion retail.',
  },
];

export default function ExperienceSection() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="eyebrow mb-4">Why women shop BFAB</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium text-black leading-[1.05]">
            Look amazing <span className="italic text-bfab-600">the easy way.</span>
          </h2>
          <p className="mt-4 text-black/60 max-w-xl font-light">
            We take the work out of getting dressed so you can spend time on what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative text-center p-7 rounded-2xl border border-black/5 bg-white hover:shadow-soft transition-all duration-500 hover:-translate-y-1 group"
            >
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-bfab-50 flex items-center justify-center group-hover:bg-bfab-600 transition-colors duration-500">
                  <feature.icon
                    className="w-6 h-6 text-bfab-600 group-hover:text-white transition-colors duration-500"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h3 className="font-display text-lg text-black mb-2">{feature.title}</h3>
              <p className="text-black/65 leading-relaxed text-sm font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
