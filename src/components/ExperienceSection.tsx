import { PackageOpen, MessageCircle, Sparkles } from 'lucide-react';

const features = [
  {
    icon: PackageOpen,
    title: 'Free Shipping & Returns within the U.S.',
    description: 'We offer free standard shipping on all orders within the U.S. and Puerto Rico. Returns and exchanges are accepted on unworn items within 10 days of delivery.',
  },
  {
    icon: MessageCircle,
    title: 'Customer Service',
    description: 'Outstanding premium support\nsupport@nomatch.us',
  },
  {
    icon: Sparkles,
    title: 'Handcrafted with Premium Materials',
    description: 'Each pair is meticulously handcrafted from 100% premium leather and top-quality materials, guaranteeing exceptional comfort and durability with every step.',
  },
];

export default function ExperienceSection() {
  return (
    <section className="bg-pink-50 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-serif font-medium text-center text-purple-600 mb-16">
          A GOLDEN EXPERIENCE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-12 h-12 text-pink-500 stroke-[1.5] group-hover:text-purple-500 transition-colors duration-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-snug">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
