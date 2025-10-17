import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackEvent } from '../firebase/analytics';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderNumber = searchParams.get('order');
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart after successful purchase
    clearCart();

    // Track successful purchase
    if (sessionId) {
      trackEvent('purchase_completed', {
        sessionId,
        orderNumber: orderNumber || '',
        timestamp: new Date().toISOString(),
      });
    }
  }, [sessionId, orderNumber, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-serif font-medium text-center text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-purple-700 font-medium">Order Number</p>
            <p className="text-lg text-purple-900 font-bold mt-1">
              {orderNumber}
            </p>
            {sessionId && (
              <p className="text-xs text-purple-600 mt-2 break-all">
                Session: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>
        )}

        {/* What's Next */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Check Your Email</h3>
              <p className="text-sm text-gray-600">
                We've sent a confirmation email with your order details and tracking information.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Estimated Delivery</h3>
              <p className="text-sm text-gray-600">
                Your order will be delivered within 3-5 business days.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/shop"
            className="flex-1 px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm text-center rounded-lg"
          >
            CONTINUE SHOPPING
          </Link>
          <Link
            to="/"
            className="flex-1 px-8 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-300 font-medium tracking-wider text-sm text-center rounded-lg"
          >
            BACK TO HOME
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order?{' '}
            <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

