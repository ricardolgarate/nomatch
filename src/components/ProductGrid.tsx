import { Link } from 'react-router-dom';

const products = [
  {
    id: 'nomatch-classic',
    name: 'NoMatch Classic',
    price: '$170',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'bloom-color-changing',
    name: 'Bloom (Color Changing)',
    price: '$230',
    images: [
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti-color-changing',
    name: 'Graffiti (Color Changing)',
    price: '$230',
    images: [
      'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'floral-snake',
    name: 'Floral snake',
    price: '$220',
    images: [
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
];

export default function ProductGrid() {
  return (
    <section className="bg-pink-50 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-serif font-medium text-center text-purple-600 mb-12">
          OUR FAVES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Link 
              key={index}
              to={`/product/${product.id}`}
              className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
            >
              <div className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-square">
                  <img
                    src={product.images[0]}
                    alt={`${product.name} - Left`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="relative aspect-square">
                  <img
                    src={product.images[1]}
                    alt={`${product.name} - Right`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-purple-600 font-semibold text-lg">
                {product.price}
              </p>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-10 space-x-2">
          <button className="w-3 h-3 rounded-full bg-gray-800" />
          <button className="w-3 h-3 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors" />
        </div>
      </div>
    </section>
  );
}
