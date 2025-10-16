import { Link } from 'react-router-dom';

const categories = [
  {
    title: 'SHOES',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'CLOTHING',
    image: 'https://images.pexels.com/photos/7679454/pexels-photo-7679454.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'UV-ACTIVATED',
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'ACCESSORIES',
    image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function CategorySection() {
  return (
    <section className="bg-pink-50 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-serif font-medium text-center text-pink-500 mb-12">
          SHOP BY CATEGORY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to="/shop"
              className="relative aspect-[3/4] rounded-lg overflow-hidden group cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <span className="bg-white px-8 py-3 text-gray-900 font-semibold tracking-wide text-sm transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:px-10">
                  {category.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
