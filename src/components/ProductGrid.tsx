import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { getAllProducts, ProductInventory } from '../firebase/inventory';

export default function ProductGrid() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts();
        const inStock = all.filter((p) => {
          if (p.sizes && Object.keys(p.sizes).length > 0) {
            return Object.values(p.sizes).some((qty) => (qty || 0) > 0);
          }
          return (p.stock || 0) > 0;
        });
        setProducts(inStock.slice(0, 4));
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="bg-[#fbf8ff] py-20 md:py-24 border-y border-bfab-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-14 max-w-3xl mx-auto">
          <span className="eyebrow mb-4">The Collection</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium text-black leading-[1.05]">
            Fresh finds we're <span className="italic text-bfab-600">loving.</span>
          </h2>
          <p className="mt-5 text-black/65 text-lg font-light">
            A few favorite pieces from the boutique, hand-picked for style,
            comfort, and confidence.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[1.5rem] border border-bfab-100 bg-white shadow-card">
                <div
                  className="aspect-[3/4] bg-gradient-to-r from-bfab-50 via-bfab-100 to-bfab-50 animate-shimmer"
                  style={{ backgroundSize: '200% 100%' }}
                />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-3/4 bg-black/10 rounded" />
                  <div className="h-3 w-1/3 bg-bfab-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-black/60 mb-6 text-lg">The collection is coming together.</p>
            <Link to="/add" className="btn-primary">
              <Plus className="w-4 h-4" />
              ADD YOUR FIRST PIECE
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cardHover">
                    <div className="relative aspect-[3/4] overflow-hidden bg-bfab-50">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                      {product.images[1] && (
                        <img
                          src={product.images[1]}
                          alt={`${product.name} alternate`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg text-black leading-tight mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-bfab-600 font-medium">{product.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-14">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-bfab-200 bg-white px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-black shadow-card transition-all hover:border-bfab-600 hover:text-bfab-600 group"
              >
                Shop the full collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
