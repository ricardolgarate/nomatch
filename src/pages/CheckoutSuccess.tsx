import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Mail, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-bfab-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-bfab-600" strokeWidth={1.5} />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-bfab-400" />
            <Sparkles className="absolute -bottom-1 -left-1 w-5 h-5 text-bfab-400" />
          </div>
        </div>

        <span className="eyebrow mb-4">Order Confirmed</span>
        <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-3 mb-5 leading-tight">
          Thank <span className="italic text-bfab-600">you.</span>
        </h1>
        <p className="text-lg text-black/70 mb-10 font-light">
          Your order has been placed. We can't wait for you to wear it.
        </p>

        {orderNumber && (
          <div className="bg-bfab-50 border border-bfab-200 rounded-xl p-5 mb-10">
            <p className="text-xs tracking-[0.25em] uppercase text-bfab-700 mb-1 font-semibold">
              Order Number
            </p>
            <p className="text-xl text-black font-medium">{orderNumber}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="p-5 rounded-xl border border-black/5 bg-white">
            <Mail className="w-5 h-5 text-bfab-600 mb-3" />
            <h3 className="font-display text-lg text-black mb-1">Check Your Email</h3>
            <p className="text-sm text-black/60">
              Once payments are connected, we'll send a confirmation with tracking.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-black/5 bg-white">
            <Package className="w-5 h-5 text-bfab-600 mb-3" />
            <h3 className="font-display text-lg text-black mb-1">Estimated Delivery</h3>
            <p className="text-sm text-black/60">3–5 business days to your door.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn-primary">
            CONTINUE SHOPPING
          </Link>
          <Link to="/" className="btn-outline">
            BACK TO HOME
          </Link>
        </div>

        <p className="text-sm text-black/50 mt-10">
          Need help?{' '}
          <Link to="/contact" className="text-bfab-600 hover:text-bfab-700 font-medium">
            Contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
