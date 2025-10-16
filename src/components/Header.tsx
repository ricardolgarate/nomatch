import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount, openCart } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const shopCategories = [
    { name: 'Shoes', path: '/shop/shoes' },
    { name: 'UV Color-Changing', path: '/shop/uv' },
    { name: 'Accessories', path: '/shop/accessories' },
    { name: 'Clothing', path: '/shop/clothing' },
  ];

  return (
    <header className="bg-pink-50/95 backdrop-blur-sm sticky top-0 z-50 border-b border-pink-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:opacity-60 transition-opacity"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>

          <Link to="/" className="flex-1 flex justify-center">
            <img 
              src="/Logo-NoMatch.webp" 
              alt="NOMATCH Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          <button 
            onClick={openCart}
            className="p-2 hover:opacity-60 transition-opacity relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {getCartCount() > 0 && (
              <span className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        <nav className="flex items-center justify-center space-x-12 pb-4 text-sm">
          <Link 
            to="/" 
            className={`hover:text-purple-600 transition-colors font-normal pb-1 ${
              location.pathname === '/' 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-900'
            }`}
          >
            Home
          </Link>
          
          <div 
            className="relative group"
            onMouseEnter={() => setShopDropdownOpen(true)}
            onMouseLeave={() => setShopDropdownOpen(false)}
          >
            <button 
              className={`flex items-center space-x-1 hover:text-purple-600 transition-colors font-normal pb-1 ${
                location.pathname.startsWith('/shop')
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-900'
              }`}
            >
              <span>Shop</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {shopDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                  {shopCategories.map((category, index) => (
                    <Link
                      key={index}
                      to={category.path}
                      className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link 
            to="/about" 
            className="text-gray-900 hover:text-purple-600 transition-colors font-normal"
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className="text-gray-900 hover:text-purple-600 transition-colors font-normal"
          >
            Contact
          </Link>
        </nav>

        {/* Search Bar */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full bg-gradient-to-br from-pink-50 to-purple-50 shadow-xl border-t border-pink-200 z-40">
            <div className="container mx-auto px-6 py-6">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all placeholder-gray-400"
                    autoFocus
                  />
                </div>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm"
                    >
                      SEARCH
                    </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-4 hover:bg-pink-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-purple-600" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
