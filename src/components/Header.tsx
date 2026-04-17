import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount, openCart } = useCart();

  useEffect(() => {
    const COLLAPSE_AT = 120;
    const EXPAND_AT = 40;
    let ticking = false;
    let lastState = window.scrollY > COLLAPSE_AT;
    setScrolled(lastState);

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (!lastState && y > COLLAPSE_AT) {
          lastState = true;
          setScrolled(true);
        } else if (lastState && y < EXPAND_AT) {
          lastState = false;
          setScrolled(false);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const navLinkClass = (active: boolean) =>
    `relative pb-1 font-medium tracking-[0.16em] uppercase text-[13px] transition-colors hover:text-bfab-600 ${
      active ? 'text-black' : 'text-black'
    }`;

  const navIndicator = (active: boolean) => (
    <span
      className={`absolute left-0 right-0 -bottom-0 h-[2px] bg-bfab-600 origin-center transition-transform duration-500 ${
        active ? 'scale-x-100' : 'scale-x-0'
      }`}
    />
  );

  return (
    <>
      <div className="bg-bfab-900 text-white text-[11px] tracking-[0.25em] text-center uppercase py-2.5">
        Complimentary shipping on domestic orders over $150
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b transition-[border-color,box-shadow] duration-500 ${
          scrolled
            ? 'border-black/10 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)]'
            : 'border-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div
            className={`flex justify-center overflow-hidden transition-[max-height,opacity,transform,margin] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled
                ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                : 'max-h-40 opacity-100 translate-y-0 mt-4'
            }`}
          >
            <Link
              to="/"
              aria-label="Beauty For Ashes Boutique — home"
              className="inline-flex items-center"
            >
              <img
                src="/BFABLOGO.png"
                alt="Beauty For Ashes Boutique"
                className="h-24 md:h-28 w-auto object-contain"
              />
            </Link>
          </div>

          <div
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled ? 'py-3.5' : 'pt-3 pb-5'
            }`}
          >
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-black hover:text-bfab-600 transition-colors justify-self-start"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <nav className="flex items-center justify-center space-x-10 md:space-x-12">
              <Link to="/" className={navLinkClass(location.pathname === '/')}>
                Home
                {navIndicator(location.pathname === '/')}
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button
                  className={`${navLinkClass(location.pathname.startsWith('/shop'))} flex items-center gap-1`}
                >
                  <span>Shop</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                  {navIndicator(location.pathname.startsWith('/shop'))}
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
                className={navLinkClass(location.pathname === '/about')}
              >
                About
                {navIndicator(location.pathname === '/about')}
              </Link>

              <Link
                to="/contact"
                className={navLinkClass(location.pathname === '/contact')}
              >
                Contact
                {navIndicator(location.pathname === '/contact')}
              </Link>
            </nav>

            <button
              onClick={openCart}
              className="p-2 text-black hover:text-bfab-600 transition-colors justify-self-end relative"
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
