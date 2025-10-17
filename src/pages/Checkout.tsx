import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackEvent } from '../firebase/analytics';
import StripePaymentForm from '../components/StripePaymentForm';

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `NM-${year}${month}${day}-${random}`;
}

export default function Checkout() {
  const { cart, getCartTotal } = useCart();
  const [showCoupons, setShowCoupons] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNumber] = useState(generateOrderNumber());
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    country: 'United States (US)',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Texas',
    zipCode: '',
    phone: '',
    orderNote: '',
  });

  // Track checkout initiated
  useEffect(() => {
    trackEvent('checkout_initiated', {
      cartTotal: getCartTotal(),
      itemCount: cart.length,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const subtotal = parseFloat(getCartTotal().replace('$', ''));
      const subtotalCents = Math.round(subtotal * 100);

      console.log('Validating coupon:', couponCode, 'Subtotal:', subtotalCents);

      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          subtotal: subtotalCents,
        }),
      });

      console.log('Validation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Validation error:', errorData);
        setCouponError(errorData.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        setValidatingCoupon(false);
        return;
      }

      const result = await response.json();
      console.log('Validation result:', result);

      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: result.discount,
          message: result.message,
        });
        setCouponError('');
        setShowCoupons(false); // Close the coupon input
      } else {
        setCouponError(result.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      setCouponError('Error validating coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const subtotal = parseFloat(getCartTotal().replace('$', ''));
  const discount = appliedCoupon ? appliedCoupon.discount / 100 : 0;
  const shipping = 0; // Free shipping
  const total = subtotal - discount + shipping;

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-medium text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Forms */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
                  Contact information
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We'll use this email to send you details and updates about your order.
                </p>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  You are currently checking out as a guest.
                </p>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
                  Shipping address
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the address where you want your order delivered.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Country/Region</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option>United States (US)</option>
                      <option>Canada</option>
                      <option>Mexico</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-purple-600"
                  >
                    + Add apartment, suite, etc.
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option>Texas</option>
                        <option>California</option>
                        <option>New York</option>
                        <option>Florida</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone (optional)"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Use same address for billing</span>
                  </label>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
                  Shipping options
                </h2>
                <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked
                        readOnly
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-medium text-gray-900">Free shipping</span>
                    </div>
                    <span className="font-semibold text-gray-900">FREE</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded inline-block">
                  Secure payment input frame
                </p>
              </div>

              {/* Order Note */}
              <div className="mb-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOrderNote}
                    onChange={(e) => setShowOrderNote(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Add a note to your order</span>
                </label>
                {showOrderNote && (
                  <textarea
                    name="orderNote"
                    value={formData.orderNote}
                    onChange={handleInputChange}
                    placeholder="Special instructions, delivery notes, etc."
                    rows={3}
                    className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Payment Section */}
              <div className="border-t border-gray-200 pt-8">
                <StripePaymentForm
                  items={cart}
                  customerInfo={{
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    address: formData.address,
                    apartment: formData.apartment,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    phone: formData.phone,
                    country: formData.country,
                  }}
                  orderNumber={orderNumber}
                  appliedCouponCode={appliedCoupon?.code}
                />
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-600 mt-6 text-center">
                By proceeding with your purchase you agree to our{' '}
                <Link to="/terms" className="text-purple-600 hover:underline">
                  Terms and Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
                Order summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.size || index}`} className="flex gap-4">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                      )}
                      <p className="text-purple-600 font-semibold mt-1">{item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Coupons */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-green-900">
                        🎟️ {appliedCoupon.code}
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-green-700">{appliedCoupon.message}</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="flex items-center justify-between w-full text-left text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <span className="font-medium">Add coupons</span>
                      {showCoupons ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {showCoupons && (
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            placeholder="Coupon code"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={validatingCoupon}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponCode.trim()}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {validatingCoupon ? 'Checking...' : 'Apply'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-red-600 mt-2">{couponError}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Free shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

