import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
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

  useEffect(() => {
    // Close any open overlays on route change
    setMobileMenuOpen(false);
    setMobileShopOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Lock body scroll when mobile drawer is open
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

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

  const navLinkClass = () =>
    `relative pb-1 font-medium tracking-[0.16em] uppercase text-[13px] transition-colors hover:text-bfab-600 text-black`;

  const navIndicator = (active: boolean) => (
    <span
      className={`absolute left-0 right-0 -bottom-0 h-[2px] bg-bfab-600 origin-center transition-transform duration-500 ${
        active ? 'scale-x-100' : 'scale-x-0'
      }`}
    />
  );

  return (
    <>
      <div className="bg-bfab-900 text-white text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.25em] text-center uppercase py-2 md:py-2.5 px-3">
        Complimentary shipping on domestic orders over $150
      </div>

      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b transition-[border-color,box-shadow] duration-500 ${
          scrolled
            ? 'border-black/10 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)]'
            : 'border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          {/* Logo row (collapses on scroll) */}
          <div
            className={`flex justify-center overflow-hidden transition-[max-height,opacity,transform,margin] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled
                ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
                : 'max-h-40 opacity-100 translate-y-0 mt-3 md:mt-4'
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
                className="h-16 sm:h-20 md:h-28 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Controls + nav row */}
          <div
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 md:gap-4 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled ? 'py-3' : 'pt-2.5 pb-4 md:pt-3 md:pb-5'
            }`}
          >
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-black hover:text-bfab-600 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-black hover:text-bfab-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile: show small brand text when logo is hidden.
                Desktop: show the nav links. */}
            <nav className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12">
              <Link to="/" className={navLinkClass()}>
                Home
                {navIndicator(location.pathname === '/')}
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setShopDropdownOpen(true)}
                onMouseLeave={() => setShopDropdownOpen(false)}
              >
                <button className={`${navLinkClass()} flex items-center gap-1`}>
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

              <Link to="/about" className={navLinkClass()}>
                About
                {navIndicator(location.pathname === '/about')}
              </Link>

              <Link to="/contact" className={navLinkClass()}>
                Contact
                {navIndicator(location.pathname === '/contact')}
              </Link>
            </nav>

            {/* Small mobile-only brand text when logo row is collapsed */}
            <div
              className={`md:hidden flex items-center justify-center text-center transition-opacity duration-500 ${
                scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Link
                to="/"
                aria-label="Beauty For Ashes Boutique — home"
                className="font-display text-lg tracking-wider text-black"
              >
                BFAB
              </Link>
            </div>

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
              <div className="container mx-auto px-4 md:px-6 py-5 md:py-8">
                <form onSubmit={handleSearch} className="flex items-center gap-2 md:gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bfab-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search…"
                      className="w-full pl-12 pr-4 py-3 md:py-4 bg-bfab-50/50 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-bfab-500 focus:border-bfab-500 text-black placeholder-black/40 transition-all"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-5 md:px-8 py-3 md:py-3.5 text-xs md:text-sm"
                  >
                    SEARCH
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 md:p-4 hover:bg-black/5 rounded-lg transition-colors"
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

      {/* Mobile slide-in menu */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside
          className={`absolute top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-black/5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center"
            >
              <img
                src="/BFABLOGO.png"
                alt="Beauty For Ashes Boutique"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-black hover:text-bfab-600 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-5 space-y-1">
            <Link
              to="/"
              className="block px-4 py-3.5 text-sm tracking-[0.16em] uppercase font-medium text-black hover:bg-bfab-50 hover:text-bfab-600 rounded-lg transition-colors"
            >
              Home
            </Link>

            <button
              onClick={() => setMobileShopOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm tracking-[0.16em] uppercase font-medium text-black hover:bg-bfab-50 hover:text-bfab-600 rounded-lg transition-colors"
            >
              <span>Shop</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  mobileShopOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                mobileShopOpen ? 'max-h-64' : 'max-h-0'
              }`}
            >
              <div className="pl-4 space-y-1 py-1">
                {shopCategories.map((c) => (
                  <Link
                    key={c.path}
                    to={c.path}
                    className="block px-4 py-3 text-[13px] tracking-[0.14em] uppercase text-black/80 hover:bg-bfab-50 hover:text-bfab-600 rounded-lg transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/about"
              className="block px-4 py-3.5 text-sm tracking-[0.16em] uppercase font-medium text-black hover:bg-bfab-50 hover:text-bfab-600 rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-3.5 text-sm tracking-[0.16em] uppercase font-medium text-black hover:bg-bfab-50 hover:text-bfab-600 rounded-lg transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="p-5 border-t border-black/5 text-xs text-black/50">
            Beauty For Ashes Boutique
          </div>
        </aside>
      </div>
    </>
  );
}
