import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartSidebar() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-bfab-600" />
            <h2 className="font-display text-xl text-black">
              Your Bag <span className="text-black/50 text-base">({getCartCount()})</span>
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-bfab-50 rounded-full flex items-center justify-center mb-5">
                <ShoppingBag className="w-8 h-8 text-bfab-600" strokeWidth={1.5} />
              </div>
              <p className="font-display text-xl text-black mb-2">Your bag is empty</p>
              <p className="text-black/50 text-sm mb-8">Add some pieces to get started</p>
              <Link to="/shop" onClick={closeCart} className="btn-primary">
                START SHOPPING
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.size || index}`}
                  className="flex gap-4 p-4 border border-black/5 rounded-xl hover:border-bfab-200 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base text-black mb-0.5 line-clamp-1">{item.name}</h3>
                    {item.size && (
                      <p className="text-xs text-black/50 mb-2 uppercase tracking-widest">
                        Size: {item.size}
                      </p>
                    )}
                    <p className="text-bfab-600 font-medium text-sm mb-2">{item.price}</p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        className="p-1 hover:bg-bfab-50 rounded-md transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5 text-black" />
                      </button>
                      <span className="px-2.5 py-0.5 bg-white border border-black/10 rounded min-w-[36px] text-center text-sm text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        className="p-1 hover:bg-bfab-50 rounded-md transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="p-2 hover:bg-bfab-50 rounded-full transition-colors self-start"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-bfab-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-black/10 p-6 space-y-3 bg-bfab-50/40">
            <div className="flex items-center justify-between">
              <span className="text-sm tracking-[0.2em] uppercase font-semibold text-black">
                Subtotal
              </span>
              <span className="font-display text-2xl text-bfab-600">{getCartTotal()}</span>
            </div>
            <p className="text-xs text-black/50">Shipping &amp; taxes calculated at checkout.</p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full"
            >
              CHECKOUT
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center py-2.5 text-sm text-black/70 hover:text-bfab-600 transition-colors tracking-wider"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
