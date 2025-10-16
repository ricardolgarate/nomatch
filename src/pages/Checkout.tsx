import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackEvent } from '../firebase/analytics';
import { createCheckoutSession, validateCoupon, calculateCartTotals } from '../lib/stripe-api';
import { CouponData } from '../lib/stripe';

export default function Checkout() {
  const { cart, getCartTotal } = useCart();
  const [showCoupons, setShowCoupons] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState('');

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

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponError('');
    const coupon = await validateCoupon(couponCode);
    
    if (coupon && coupon.valid) {
      setAppliedCoupon(coupon);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle Stripe checkout
  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const checkoutData = {
        items: cart,
        couponCode: appliedCoupon?.id,
        customerEmail: formData.email,
      };

      const result = await createCheckoutSession(checkoutData) as { url: string; sessionId: string };
      
      // Track checkout attempt
      trackEvent('checkout_attempted', {
        cartTotal: totals.total,
        itemCount: cart.length,
        couponUsed: !!appliedCoupon,
      });

      // Redirect to Stripe checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };


  // Calculate totals with coupon
  const totals = calculateCartTotals(cart, appliedCoupon);

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
            <form onSubmit={handleStripeCheckout}>
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

              {/* Payment Options */}
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
                  Payment options
                </h2>

                {/* Credit/Debit Card */}
                <div className="border-2 border-purple-300 rounded-lg mb-4 overflow-hidden">
                  <label className="flex items-center justify-between p-4 cursor-pointer bg-purple-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-medium text-gray-900">Credit / Debit Card</span>
                    </div>
                    <div className="flex gap-1">
                      <img src="https://cdn-icons-png.flaticon.com/32/349/349221.png" alt="Visa" className="h-6" />
                      <img src="https://cdn-icons-png.flaticon.com/32/349/349228.png" alt="Mastercard" className="h-6" />
                      <img src="https://cdn-icons-png.flaticon.com/32/349/349230.png" alt="Amex" className="h-6" />
                      <img src="https://cdn-icons-png.flaticon.com/32/349/349229.png" alt="Discover" className="h-6" />
                    </div>
                  </label>

                  {paymentMethod === 'card' && (
                    <div className="p-4 space-y-4 bg-white border-t">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Card number</label>
                        <input
                          type="text"
                          placeholder="1234 1234 1234 1234"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Expiration date</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Security code</label>
                          <input
                            type="text"
                            placeholder="CVC"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        By providing your card information, you allow NoMatch to charge your card for future payments in accordance with their terms.
                      </p>
                    </div>
                  )}
                </div>

                {/* Klarna */}
                <div className="border-2 border-gray-200 rounded-lg mb-4">
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'klarna'}
                        onChange={() => setPaymentMethod('klarna')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-medium text-gray-900">Klarna</span>
                    </div>
                    <div className="bg-pink-100 px-3 py-1 rounded font-bold text-pink-600 text-sm">K</div>
                  </label>
                </div>

                {/* Afterpay */}
                <div className="border-2 border-gray-200 rounded-lg mb-4">
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'afterpay'}
                        onChange={() => setPaymentMethod('afterpay')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="font-medium text-gray-900">Afterpay</span>
                    </div>
                    <div className="text-teal-500 font-bold text-lg">◊</div>
                  </label>
                </div>
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

              {/* Terms */}
              <p className="text-sm text-gray-600 mb-6">
                By proceeding with your purchase you agree to our{' '}
                <Link to="/terms" className="text-purple-600 hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-purple-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Return to Cart
                </Link>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 px-8 py-4 font-semibold rounded-lg transition-colors shadow-lg ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-pink-500 hover:bg-pink-600 hover:shadow-xl'
                  } text-white flex items-center justify-center gap-2`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </form>
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
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-sm text-red-600">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {appliedCoupon.id} applied
                            {appliedCoupon.percent_off && ` (${appliedCoupon.percent_off}% off)`}
                            {appliedCoupon.amount_off && ` ($${(appliedCoupon.amount_off / 100).toFixed(2)} off)`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && totals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.id})</span>
                    <span className="font-semibold">-${totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Free shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

