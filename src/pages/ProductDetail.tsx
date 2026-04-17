import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Clock, AlertCircle, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduct, ProductInventory } from '../firebase/inventory';

export default function ProductDetail() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping'>('details');
  const [product, setProduct] = useState<ProductInventory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!productId) return;
      try {
        const firestoreProduct = await getProduct(productId);
        setProduct(firestoreProduct);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const hasSizes = !!(product?.sizes && Object.keys(product.sizes).length > 0);
  const availableSizes = hasSizes ? Object.keys(product!.sizes!) : [];

  const getSizeStock = (size: string) => product?.sizes?.[size] || 0;
  const isSizeOutOfStock = (size: string) => getSizeStock(size) === 0;

  const isOutOfStock = () => {
    if (hasSizes) {
      return Object.values(product!.sizes!).every((qty) => qty === 0);
    }
    return (product?.stock || 0) === 0;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (hasSizes && !selectedSize) {
      alert('Please select a size');
      return;
    }

    if (selectedSize) {
      const stock = getSizeStock(selectedSize);
      if (stock === 0) {
        alert('This size is out of stock');
        return;
      }
      if (quantity > stock) {
        alert(`Only ${stock} items available for this size`);
        return;
      }
    } else {
      const stock = product.stock || 0;
      if (stock === 0) {
        alert('This item is out of stock');
        return;
      }
      if (quantity > stock) {
        alert(`Only ${stock} items available`);
        return;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || undefined,
      category: product.category,
      quantity,
    });
  };

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-bfab-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-black/60">Loading…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-bfab-200 mx-auto mb-4" />
          <h2 className="font-display text-3xl text-black mb-2">Product Not Found</h2>
          <p className="text-black/60 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn-primary">
            BACK TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-black/60">
          <Link to="/" className="hover:text-bfab-600">Home</Link>
          <span>›</span>
          <Link
            to={`/shop/${String(product.category).toLowerCase()}`}
            className="hover:text-bfab-600"
          >
            {product.category}
          </Link>
          <span>›</span>
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <div className="relative bg-bfab-50 rounded-2xl overflow-hidden mb-4 aspect-square">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-card"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-card"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 text-black" />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square bg-bfab-50 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-bfab-600'
                        : 'border-transparent hover:border-black/20'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="eyebrow mb-3">{product.category}</span>
            <h1 className="font-display text-4xl md:text-5xl text-black mt-3 mb-4 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl text-bfab-600 font-medium mb-8">{product.price}</p>

            <div className="mb-8 space-y-3">
              <p className="text-base text-black font-medium">{product.description}</p>
              {product.details && (
                <p className="text-base text-black/70 leading-relaxed font-light">{product.details}</p>
              )}
            </div>

            {isOutOfStock() && (
              <div className="mb-6 bg-black/5 border border-black/10 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-black mb-0.5">Sold Out</p>
                  <p className="text-sm text-black/60">
                    This piece is currently unavailable. Check back soon.
                  </p>
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="mb-8">
                <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-black mb-3">
                  Size
                </label>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                  {availableSizes.map((size) => {
                    const sizeStock = getSizeStock(size);
                    const outOfStock = isSizeOutOfStock(size);
                    const isShoeSize = /^[\d.]+$/.test(size);

                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`relative px-3 py-3 border rounded-lg font-medium transition-all text-sm ${
                          outOfStock
                            ? 'border-black/10 bg-black/5 text-black/40 cursor-not-allowed line-through'
                            : selectedSize === size
                            ? 'border-bfab-600 bg-bfab-50 text-bfab-600'
                            : 'border-black/15 bg-white text-black hover:border-bfab-600 hover:bg-bfab-50'
                        }`}
                        title={outOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                      >
                        {isShoeSize ? `US ${size}` : size}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && !isSizeOutOfStock(selectedSize) && (
                  <p className="mt-3 text-sm text-bfab-600">
                    ✓ {getSizeStock(selectedSize)} available
                  </p>
                )}
              </div>
            )}

            {!hasSizes && product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
              <div className="mb-6 bg-bfab-50 border border-bfab-200 rounded-lg p-3">
                <p className="text-sm text-bfab-700">Only {product.stock} left in stock</p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center border border-black/15 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-black/5 transition-colors text-black"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-5 py-3 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-black/5 transition-colors text-black"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock()}
                className={`flex-1 px-8 py-3.5 font-semibold rounded-lg transition-all duration-300 text-sm tracking-[0.2em] ${
                  isOutOfStock()
                    ? 'bg-black/10 text-black/40 cursor-not-allowed'
                    : 'bg-bfab-600 text-white hover:bg-bfab-700 shadow-soft hover:shadow-cardHover hover:-translate-y-0.5'
                }`}
              >
                {isOutOfStock() ? 'SOLD OUT' : 'ADD TO BAG'}
              </button>
            </div>

            <div className="space-y-3 border-t border-black/10 pt-6 text-sm">
              <div className="flex items-center gap-3 text-black/80">
                <Truck className="w-4 h-4 text-bfab-600" />
                <span>Complimentary shipping on orders over $150</span>
              </div>
              <div className="flex items-center gap-3 text-black/80">
                <Clock className="w-4 h-4 text-bfab-600" />
                <span>Delivers in 3–5 business days</span>
              </div>
              <div className="flex items-center gap-3 text-black/80">
                <Package className="w-4 h-4 text-bfab-600" />
                <span>Easy 10-day returns</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-black/10 text-xs text-black/50 space-x-4">
              {product.sku && <span>SKU: {product.sku}</span>}
              <span>Category: {product.category}</span>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div className="flex justify-center gap-12 border-b border-black/10">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-sm tracking-[0.2em] uppercase font-medium transition-colors relative ${
                activeTab === 'details' ? 'text-black' : 'text-black/50 hover:text-black'
              }`}
            >
              Description
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bfab-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-sm tracking-[0.2em] uppercase font-medium transition-colors relative ${
                activeTab === 'shipping' ? 'text-black' : 'text-black/50 hover:text-black'
              }`}
            >
              Shipping &amp; Returns
              {activeTab === 'shipping' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bfab-600" />
              )}
            </button>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            {activeTab === 'details' && (
              <div className="space-y-6 text-black/80 leading-relaxed font-light">
                <p>{product.details || product.description}</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-8 text-black/80 font-light">
                <div>
                  <h3 className="font-display text-xl text-black mb-3">Shipping</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Complimentary shipping on domestic orders over $150.</li>
                    <li>Express delivery available — arrives in 3–4 business days.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-xl text-black mb-3">Returns</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Free domestic returns within 10 days of delivery.</li>
                    <li>Items must be in original condition — unworn, unwashed, tags attached.</li>
                    <li>Free exchanges within 20 days on unworn items.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
