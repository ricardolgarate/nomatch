import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
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
    { name: 'Clothing', path: '/shop/clothing' },
    { name: 'Accessories', path: '/shop/accessories' },
  ];

  return (
    <>
      <div className="bg-bfab-900 text-white text-[11px] tracking-[0.25em] text-center py-2.5 uppercase">
        Complimentary shipping on domestic orders over $150
      </div>

      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-black/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            <div className="flex-1 flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-black hover:text-bfab-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img
                src="/BFAB-Logo.jpg"
                alt="Beauty For Ashes Boutique"
                className="h-16 w-auto object-contain"
              />
            </Link>

            <div className="flex-1 flex items-center justify-end gap-3">
              <button
                onClick={openCart}
                className="p-2 text-black hover:text-bfab-600 transition-colors relative"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-bfab-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-center space-x-12 pb-5 text-[13px] tracking-[0.16em] uppercase">
            <Link
              to="/"
              className={`hover:text-bfab-600 transition-colors font-medium pb-1 border-b-2 ${
                location.pathname === '/'
                  ? 'text-black border-bfab-600'
                  : 'text-black border-transparent'
              }`}
            >
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShopDropdownOpen(true)}
              onMouseLeave={() => setShopDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-1 hover:text-bfab-600 transition-colors font-medium pb-1 border-b-2 ${
                  location.pathname.startsWith('/shop')
                    ? 'text-black border-bfab-600'
                    : 'text-black border-transparent'
                }`}
              >
                <span>Shop</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {shopDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                  <div className="w-60 bg-white rounded-xl shadow-soft border border-black/5 py-2">
                    {shopCategories.map((category, index) => (
                      <Link
                        key={index}
                        to={category.path}
                        className="block px-6 py-3 text-sm tracking-[0.14em] uppercase text-black hover:bg-bfab-50 hover:text-bfab-600 transition-colors"
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
              className={`hover:text-bfab-600 transition-colors font-medium pb-1 border-b-2 ${
                location.pathname === '/about'
                  ? 'text-black border-bfab-600'
                  : 'text-black border-transparent'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`hover:text-bfab-600 transition-colors font-medium pb-1 border-b-2 ${
                location.pathname === '/contact'
                  ? 'text-black border-bfab-600'
                  : 'text-black border-transparent'
              }`}
            >
              Contact
            </Link>
          </nav>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full bg-white shadow-soft border-t border-black/5 z-40">
              <div className="container mx-auto px-6 py-8">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-bfab-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search shoes, clothing, accessories…"
                      className="w-full pl-14 pr-4 py-4 bg-bfab-50/50 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-bfab-500 focus:border-bfab-500 text-black placeholder-black/40 transition-all"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    SEARCH
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-4 hover:bg-black/5 rounded-lg transition-colors"
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 text-black" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
