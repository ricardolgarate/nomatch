import { PackageOpen, MessageCircle, Sparkles } from 'lucide-react';

const features = [
  {
    icon: PackageOpen,
    title: 'Free Shipping Over $150',
    description:
      'Free standard shipping on domestic orders over $150. Easy returns within 10 days.',
  },
  {
    icon: MessageCircle,
    title: 'Real People, Real Help',
    description:
      'Questions? Styling help? Email us at shopbfabllc@gmail.com or call (469) 297-6359.',
  },
  {
    icon: Sparkles,
    title: 'Hand-Picked Every Piece',
    description:
      'Every item in the boutique is chosen by Catrice. New or gently worn — always good.',
  },
];

export default function ExperienceSection() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="eyebrow mb-4">The BFAB Way</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium text-black leading-[1.05]">
            Shop with a little <span className="italic text-bfab-600">love</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative text-center p-8 rounded-2xl border border-black/5 bg-white hover:shadow-soft transition-all duration-500 hover:-translate-y-1 group"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-bfab-50 flex items-center justify-center group-hover:bg-bfab-600 transition-colors duration-500">
                  <feature.icon className="w-7 h-7 text-bfab-600 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-display text-xl text-black mb-3">{feature.title}</h3>
              <p className="text-black/65 leading-relaxed text-sm whitespace-pre-line font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
