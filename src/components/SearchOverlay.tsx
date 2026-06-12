import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package, Search, X } from 'lucide-react';
import { getAllProducts, ProductInventory } from '../firebase/inventory';

const quickLinks = [
  { name: "Women's Clothing", path: '/shop/womens-clothing' },
  { name: 'Shoes', path: '/shop/shoes' },
  { name: 'Accessories', path: '/shop/accessories' },
  { name: "Men's", path: '/shop/mens' },
  { name: 'Kids', path: '/shop/kids' },
  { name: 'Giftables', path: '/shop/giftables' },
];

function isOutOfStock(product: ProductInventory) {
  if (product.sizes && Object.keys(product.sizes).length > 0) {
    return Object.values(product.sizes).every((qty) => qty === 0);
  }
  return (product.stock || 0) === 0;
}

type SearchOverlayProps = {
  open: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
};

export default function SearchOverlay({
  open,
  query,
  onQueryChange,
  onClose,
}: SearchOverlayProps) {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);
    getAllProducts()
      .then((allProducts) => {
        if (!mounted) return;
        setProducts(allProducts.filter((product) => !isOutOfStock(product)));
      })
      .catch((error) => {
        console.error('Error loading search products:', error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sortedProducts = [...products].sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    if (!normalizedQuery) {
      return sortedProducts.slice(0, 6);
    }

    return sortedProducts
      .filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.subcategory,
          product.description,
          product.sku,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [products, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-white">
      <div className="absolute inset-0 bg-hero-radial opacity-70 pointer-events-none" />
      <button
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-soft transition-colors hover:text-bfab-600 md:right-8 md:top-8"
        aria-label="Close search"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-3xl text-center">
          <span className="eyebrow mb-4">Search BFAB</span>
          <h2 className="font-display text-4xl font-medium leading-tight text-black md:text-6xl">
            What are you looking for?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-black/60 md:text-base">
            Find clothing, shoes, accessories, kids pieces, giftables, and handpicked
            pre-loved gems without leaving the page.
          </p>
        </div>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="mx-auto mt-10 flex w-full max-w-3xl items-center border-b border-black/25 pb-3"
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name, category, or style..."
            className="min-w-0 flex-1 bg-transparent pr-4 font-display text-2xl text-black outline-none placeholder:text-black/35 md:text-3xl"
          />
          <Search className="h-6 w-6 shrink-0 text-bfab-600" />
        </form>

        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-wrap justify-center gap-2">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className="rounded-full border border-bfab-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black/65 shadow-sm transition-colors hover:border-bfab-400 hover:text-bfab-700"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/55">
              <Loader2 className="mb-3 h-6 w-6 animate-spin text-bfab-600" />
              Loading boutique pieces...
            </div>
          ) : results.length === 0 ? (
            <div className="mx-auto max-w-md rounded-[1.5rem] border border-bfab-100 bg-white p-8 text-center shadow-card">
              <Package className="mx-auto mb-4 h-10 w-10 text-bfab-300" />
              <h3 className="font-display text-2xl text-black">No matches yet</h3>
              <p className="mt-2 text-sm font-light text-black/60">
                Try another word, browse the categories, or check back as new pieces are added.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-[1.25rem] border border-white bg-white shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cardHover">
                    <div className="aspect-square overflow-hidden bg-bfab-50">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="line-clamp-2 font-display text-base leading-tight text-black">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-bfab-600">{product.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
