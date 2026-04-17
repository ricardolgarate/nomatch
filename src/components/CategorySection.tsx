import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    title: 'Shoes',
    blurb: 'Heels, sneakers & everyday pairs',
    path: '/shop/shoes',
    image:
      'https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Clothing',
    blurb: 'Pieces that wear you confidently',
    path: '/shop/clothing',
    image:
      'https://images.pexels.com/photos/7679454/pexels-photo-7679454.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Accessories',
    blurb: 'The little things that say a lot',
    path: '/shop/accessories',
    image:
      'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function CategorySection() {
  return (
    <section className="bg-bfab-50/60 py-24 border-y border-black/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <span className="eyebrow mb-4">Shop by Category</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium text-black leading-[1.05]">
            Find your <span className="italic text-bfab-600">statement.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
          {categories.map((category) => (
            <Link
              key={category.title}
              to={category.path}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-card hover:shadow-cardHover transition-all duration-500"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-bfab-900/90" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <h3 className="font-display text-3xl md:text-4xl mb-1">
                  {category.title}
                </h3>
                <p className="text-white/80 text-sm mb-4">{category.blurb}</p>
                <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold opacity-90 group-hover:opacity-100">
                  Shop now
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
