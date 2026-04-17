import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Grid3x3, List, AlertCircle, Package, Plus } from 'lucide-react';
import { getAllProducts, ProductInventory } from '../firebase/inventory';

const categories = [
  { name: 'Shoes', path: '/shop/shoes' },
  { name: 'Clothing', path: '/shop/clothing' },
  { name: 'Accessories', path: '/shop/accessories' },
];

export default function Shop() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    (async () => {
      try {
        const firestoreProducts = await getAllProducts();
        const sorted = firestoreProducts.sort((a, b) => a.id.localeCompare(b.id));
        setProducts(sorted);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getCurrentCategory = () => {
    if (searchQuery) return 'Search Results';
    const path = location.pathname.toLowerCase();
    if (path.includes('/shop/accessories')) return 'Accessories';
    if (path.includes('/shop/clothing')) return 'Clothing';
    if (path.includes('/shop/shoes')) return 'Shoes';
    return 'Shop';
  };

  const currentCategory = getCurrentCategory();

  const getFilteredProducts = () => {
    let filtered = products;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query)
      );
    } else if (currentCategory !== 'Shop') {
      filtered = products.filter((p) => p.category === currentCategory);
    }
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const isOutOfStock = (product: ProductInventory) => {
    if (product.sizes && Object.keys(product.sizes).length > 0) {
      return Object.values(product.sizes).every((qty) => qty === 0);
    }
    return (product.stock || 0) === 0;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname, location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 overflow-hidden bg-black">
        <img
          src="https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="text-[11px] tracking-[0.5em] uppercase mb-4 text-bfab-200">
            Beauty For Ashes Boutique
          </span>
          <h1 className="font-display text-6xl md:text-7xl font-light">{currentCategory}</h1>
          {searchQuery && (
            <p className="text-lg text-white/80 mt-3">
              Results for <span className="italic">"{searchQuery}"</span>
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-64 flex-shrink-0">
            <h3 className="text-[11px] font-semibold text-black mb-5 tracking-[0.3em] uppercase">
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/shop"
                  className={`flex items-center justify-between w-full py-2.5 text-left text-sm transition-colors ${
                    currentCategory === 'Shop'
                      ? 'text-bfab-600 font-medium'
                      : 'text-black hover:text-bfab-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {currentCategory === 'Shop' && <ChevronRight className="w-3.5 h-3.5" />}
                    All
                  </span>
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className={`flex items-center justify-between w-full py-2.5 text-left text-sm transition-colors ${
                      currentCategory === category.name
                        ? 'text-bfab-600 font-medium'
                        : 'text-black hover:text-bfab-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {currentCategory === category.name && <ChevronRight className="w-3.5 h-3.5" />}
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link to="/add" className="btn-outline mt-8 w-full">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-10">
              <p className="text-sm text-black/60">
                {filteredProducts.length === 0 ? 0 : startIndex + 1}–
                {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} item
                {filteredProducts.length === 1 ? '' : 's'}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 border border-black/10 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'list' ? 'bg-bfab-50 text-bfab-600' : 'hover:bg-black/5 text-black/60'
                    }`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 transition-colors ${
                      viewMode === 'grid' ? 'bg-bfab-50 text-bfab-600' : 'hover:bg-black/5 text-black/60'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-14">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
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
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Package className="w-14 h-14 text-bfab-200 mx-auto mb-5" />
                  <h3 className="font-display text-2xl text-black mb-2">
                    {searchQuery ? `No results for "${searchQuery}"` : 'The boutique is empty'}
                  </h3>
                  <p className="text-black/60 mb-8">
                    {searchQuery
                      ? 'Try searching with different keywords.'
                      : 'Add your first piece and start curating.'}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {searchQuery && (
                      <Link to="/shop" className="btn-primary">
                        VIEW ALL
                      </Link>
                    )}
                    <Link to="/add" className="btn-outline">
                      ADD PRODUCT
                    </Link>
                  </div>
                </div>
              ) : (
                currentProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group block">
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
                        {isOutOfStock(product) && (
                          <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 tracking-[0.2em] uppercase shadow-sm">
                            <AlertCircle className="w-3 h-3" />
                            Sold Out
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg text-black mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-bfab-600 font-medium">{product.price}</p>
                          {isOutOfStock(product) && (
                            <span className="text-black/50 text-[10px] uppercase tracking-widest">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-black/5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded text-sm ${
                      currentPage === i + 1
                        ? 'bg-bfab-600 text-white'
                        : 'hover:bg-black/5 text-black'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-black/5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
