import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Grid3x3, List, LayoutGrid, AlertCircle, Package } from 'lucide-react';
import { getAllProducts, ProductInventory } from '../firebase/inventory';
import { trackEvent } from '../firebase/analytics';

const categories = [
  { name: 'Shoes', count: 0, path: '/shop/shoes' },
  { name: 'UV Color-Changing', count: 0, path: '/shop/uv' },
  { name: 'Accessories', count: 0, path: '/shop/accessories' },
  { name: 'Clothing', count: 0, path: '/shop/clothing' },
];

// Fallback hardcoded products in case Firestore is empty
const fallbackProducts = [
  // Shoes
  {
    id: 'nomatch-classic',
    name: 'NoMatch Classic',
    price: '$170',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'bloom-color-changing',
    name: 'Bloom (Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'bloom-silver',
    name: 'Bloom Silver (Color Changing)',
    price: '$240',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'daisy-dream-silver',
    name: 'Daisy dream Silver (Color Changing)',
    price: '$240',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'daisy-dream',
    name: 'Daisy dream(Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'floral-snake',
    name: 'Floral snake',
    price: '$220',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    price: '$220',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti-color-changing',
    name: 'Graffiti (Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/3076787/pexels-photo-3076787.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3189024/pexels-photo-3189024.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti-silver',
    name: 'Graffiti Silver',
    price: '$240',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2300333/pexels-photo-2300333.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'monogram-bold',
    name: 'Monogram Bold',
    price: '$220',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1456713/pexels-photo-1456713.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'monogram-metallic',
    name: 'Monogram Metallic (Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2300335/pexels-photo-2300335.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'good-luck',
    name: 'Good luck',
    price: '$220',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2529153/pexels-photo-2529153.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1456715/pexels-photo-1456715.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'xoxo-color-changing',
    name: 'XOXO (Color Changing)',
    price: '$240',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti-pink',
    name: 'Graffiti Pink',
    price: '$240',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'love-color-changing',
    name: 'LOVE (Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'text-me-color-changing',
    name: 'Text me (Color Changing)',
    price: '$230',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'pillow-wedge-limited',
    name: 'Pillow Wedge – Limited Edition',
    price: '$250',
    category: 'Shoes',
    images: [
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  // Accessories
  {
    id: 'gold-signature-charm',
    name: 'Gold Signature Charm',
    price: '$20',
    category: 'Accessories',
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'silver-signature-charm',
    name: 'Silver Signature Charm',
    price: '$15',
    category: 'Accessories',
    images: [
      'https://images.pexels.com/photos/1457843/pexels-photo-1457843.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1457840/pexels-photo-1457840.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  // Clothing
  {
    id: 'bloom-cap-pink',
    name: 'Bloom UV-Activated Cap in Light Pink',
    price: '$38',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'daisy-cap-yellow',
    name: 'Daisy Dreams UV Activated Cap in Yellow',
    price: '$38',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/984620/pexels-photo-984620.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'signature-cap-dark-pink',
    name: 'Signature "Made to NoMatch" UV-Activated Cap in Dark Pink',
    price: '$38',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1124467/pexels-photo-1124467.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'xoxo-cap-purple',
    name: 'XOXO UV-Activated Cap in Purple',
    price: '$38',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/1646647/pexels-photo-1646647.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1646648/pexels-photo-1646648.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'graffiti-hoodie',
    name: 'NoMatch Graffiti Hoodie',
    price: '$60',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
  {
    id: 'pink-signature-hoodie',
    name: 'NoMatch Pink Signature Hoodie',
    price: '$60',
    category: 'Clothing',
    images: [
      'https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3755709/pexels-photo-3755709.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
  },
];

export default function Shop() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  // Fetch products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const firestoreProducts = await getAllProducts();
        if (firestoreProducts.length > 0) {
          // Sort products by ID to maintain consistent order
          const sortedProducts = firestoreProducts.sort((a, b) => a.id.localeCompare(b.id));
          setProducts(sortedProducts);
        } else {
          // Use fallback if Firestore is empty
          setProducts(fallbackProducts as any);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts(fallbackProducts as any);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Determine current category from URL
  const getCurrentCategory = () => {
    // If searching, return 'Search Results'
    if (searchQuery) return 'Search Results';
    
    const path = location.pathname.toLowerCase();
    if (path.includes('/shop/uv')) return 'UV Color-Changing';
    if (path.includes('/shop/accessories')) return 'Accessories';
    if (path.includes('/shop/clothing')) return 'Clothing';
    if (path.includes('/shop/shoes')) return 'Shoes';
    // Default to showing all when just on /shop
    return 'Shoes';
  };

  const currentCategory = getCurrentCategory();

  // Filter products based on category or search
  const getFilteredProducts = () => {
    let filtered = products;

    // If there's a search query, filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    } else {
      // Otherwise filter by category
      if (currentCategory === 'UV Color-Changing') {
        filtered = products.filter(p => p.name.includes('Color Changing') || p.name.includes('UV-Activated') || p.name.includes('UV Activated'));
      } else if (currentCategory === 'Accessories') {
        filtered = products.filter(p => p.category === 'Accessories');
      } else if (currentCategory === 'Clothing') {
        filtered = products.filter(p => p.category === 'Clothing');
      } else if (currentCategory === 'Shoes') {
        filtered = products.filter(p => p.category === 'Shoes');
      }
    }
    
    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Helper function to check if product is out of stock
  const isOutOfStock = (product: ProductInventory) => {
    if (product.sizes) {
      return Object.values(product.sizes).every(qty => qty === 0);
    }
    return (product.stock || 0) === 0;
  };

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Track shop visit
  useEffect(() => {
    trackEvent('shop_visit', { 
      page: 'shop',
      category: currentCategory,
      search: searchQuery 
    });
  }, []);

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Hero Banner */}
      <div 
        className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1920')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-serif text-white font-light">{currentCategory}</h1>
            {searchQuery && (
              <p className="text-xl text-white/90 mt-4">
                Searching for: <span className="font-semibold">"{searchQuery}"</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wider">
              CATEGORIES
            </h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link 
                    to={category.path}
                    className={`flex items-center justify-between w-full py-2 text-left transition-colors ${
                      currentCategory === category.name
                        ? 'text-purple-600 font-medium' 
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {currentCategory === category.name && <ChevronRight className="w-4 h-4" />}
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} item(s)
              </p>
              
              <div className="flex items-center gap-4">
                {/* View Mode Buttons */}
                <div className="flex gap-1 border border-gray-200 rounded">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' && 'bg-purple-100'}`}
                  >
                    <Grid3x3 className="w-5 h-5 text-purple-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50">
                    <LayoutGrid className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select className="border border-gray-200 rounded px-4 py-2 text-sm text-gray-700 focus:outline-none focus:border-purple-500">
                  <option>Sort by</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Name: A to Z</option>
                  <option>Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? `No results found for "${searchQuery}"` : 'No products found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery ? 'Try searching with different keywords' : 'Check back later for new products'}
                  </p>
                  {searchQuery && (
                    <Link
                      to="/shop"
                      className="inline-block px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm"
                    >
                      VIEW ALL PRODUCTS
                    </Link>
                  )}
                </div>
              ) : currentProducts.map((product, index) => (
                <Link 
                  key={index} 
                  to={`/product/${product.id}`}
                  className="group cursor-pointer relative"
                >
                  <div className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative aspect-square">
                      <img
                        src={product.images[0]}
                        alt={`${product.name} - Left`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                      />
                      <img
                        src={product.images[1] || product.images[0]}
                        alt={`${product.name} - Right`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      {isOutOfStock(product) && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <AlertCircle className="w-3 h-3" />
                          OUT OF STOCK
                        </div>
                      )}
                    </div>
                    <div className="relative aspect-square">
                      <img
                        src={product.images[1] || product.images[0]}
                        alt={`${product.name} - Right`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition-opacity duration-300"
                      />
                      <img
                        src={product.images[0]}
                        alt={`${product.name} - Left`}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      {isOutOfStock(product) && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                          <AlertCircle className="w-3 h-3" />
                          OUT OF STOCK
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-normal text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-purple-600 font-normal text-base">
                      {product.price}
                    </p>
                    {isOutOfStock(product) && (
                      <span className="text-red-600 text-xs font-semibold">No Stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded ${
                    currentPage === i + 1
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

