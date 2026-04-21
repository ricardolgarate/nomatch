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
    <section className="bg-bfab-50/60 py-24 border-y border-black/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-14">
          <span className="eyebrow mb-4">The Collection</span>
          <h2 className="font-display text-5xl md:text-6xl font-medium text-black leading-[1.05]">
            Our <span className="italic text-bfab-600">Faves</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
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
            <p className="text-black/60 mb-6 text-lg">The collection is being curated.</p>
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
                  <div className="card card-hover overflow-hidden">
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
                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <div className="bg-white/95 backdrop-blur-sm text-center py-3 text-xs tracking-[0.25em] uppercase font-medium text-bfab-600">
                          Quick View
                        </div>
                      </div>
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
                className="inline-flex items-center gap-2 text-black hover:text-bfab-600 transition-colors text-sm tracking-[0.25em] uppercase font-medium group"
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
