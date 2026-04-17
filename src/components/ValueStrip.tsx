import { Truck, RefreshCcw, Heart, Sparkles } from 'lucide-react';

const items = [
  {
    icon: Truck,
    title: 'Free shipping over $150',
    sub: 'Ships in 1–2 business days',
  },
  {
    icon: RefreshCcw,
    title: 'Easy 10-day returns',
    sub: 'Love it or send it back',
  },
  {
    icon: Heart,
    title: 'Sized for every body',
    sub: 'XS to plus, curated with care',
  },
  {
    icon: Sparkles,
    title: 'Picked by a stylist',
    sub: '20+ years in fashion retail',
  },
];

export default function ValueStrip() {
  return (
    <section className="bg-bfab-50/50 border-y border-black/5">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 text-center md:text-left">
          {items.map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex flex-col md:flex-row items-center md:items-start gap-3 justify-center md:justify-start"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-white border border-black/5 flex items-center justify-center">
                <Icon className="w-4 h-4 text-bfab-600" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-[12px] md:text-[13px] font-semibold text-black tracking-[0.06em]">
                  {title}
                </p>
                <p className="text-[11px] text-black/55 font-light">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
