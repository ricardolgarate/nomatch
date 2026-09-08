import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Lock, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '../context/CartContext';
import { createPaymentIntent } from '../lib/checkout';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const CATRICE_DISCOUNT_CODE = 'CATRICE#1';

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `BFAB-${year}${month}${day}-${random}`;
}

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [showOrderNote, setShowOrderNote] = useState(false);
  const [orderNumber] = useState(generateOrderNumber());
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setClientSecret(null);
  };

  const subtotal = parseFloat(getCartTotal().replace('$', ''));
  const shipping = 0;
  const oneDollarSubtotal = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount = discountCode
    ? Math.max(0, subtotal - oneDollarSubtotal)
    : 0;
  const total = subtotal - discount + shipping;

  const handleDiscountCode = () => {
    if (discountCode) {
      setDiscountCode(null);
      setDiscountInput('');
      setDiscountError(null);
      setClientSecret(null);
      return;
    }

    if (discountInput.trim().toUpperCase() !== CATRICE_DISCOUNT_CODE) {
      setDiscountError('That discount code is not valid.');
      setDiscountCode(null);
      setClientSecret(null);
      return;
    }

    setDiscountCode(CATRICE_DISCOUNT_CODE);
    setDiscountInput(CATRICE_DISCOUNT_CODE);
    setDiscountError(null);
    setClientSecret(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError(null);
    try {
      const checkout = await createPaymentIntent({
        orderNumber,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          size: item.size,
        })),
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          apartment: formData.apartment || undefined,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone || undefined,
          country: formData.country,
          orderNote: formData.orderNote || undefined,
        },
        discountCode: discountCode || undefined,
      });

      setClientSecret(checkout.clientSecret);
      setPlacing(false);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not place the order. Please try again.',
      );
      setPlacing(false);
    }
  };

  const stripeOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#8a1fd1',
            borderRadius: '10px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      }
    : undefined;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-20 h-20 text-bfab-200 mx-auto mb-6" />
          <h2 className="font-display text-4xl font-medium text-black mb-4">Your bag is empty</h2>
          <p className="text-black/60 mb-8 font-light">
            Looks like you haven't added anything yet. Start shopping to find something you love.
          </p>
          <Link to="/shop" className="btn-primary">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bfab-50/40">
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-10">
          <span className="eyebrow mb-3">Secure Checkout</span>
          <h1 className="font-display text-5xl md:text-6xl font-medium text-black mt-2">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-card border border-black/5 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-display text-2xl text-black mb-2">Contact</h2>
              <p className="text-sm text-black/60 mb-4 font-light">
                We'll use this email to send order updates.
              </p>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-base"
              />
            </div>

            <div className="mb-8">
              <h2 className="font-display text-2xl text-black mb-2">Shipping address</h2>
              <p className="text-sm text-black/60 mb-4 font-light">
                Where should we deliver your order?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase font-semibold text-black mb-1.5">
                    Country / Region
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input-base"
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
                    className="input-base"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-base"
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  placeholder="Street address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-base"
                />

                <input
                  type="text"
                  name="apartment"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="input-base"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-base"
                  />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-base"
                  >
                    <option>Texas</option>
                    <option>California</option>
                    <option>New York</option>
                    <option>Florida</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP code"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="input-base"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-base"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="w-4 h-4 accent-bfab-600"
                  />
                  <span className="text-sm text-black/80">Use same address for billing</span>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-display text-2xl text-black mb-3">Shipping</h2>
              <div className="border-2 border-bfab-600 rounded-lg p-4 bg-bfab-50">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked
                      readOnly
                      className="w-4 h-4 accent-bfab-600"
                    />
                    <span className="font-medium text-black">Standard shipping</span>
                  </div>
                  <span className="font-semibold text-bfab-700 text-sm tracking-widest uppercase">Free</span>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOrderNote}
                  onChange={(e) => setShowOrderNote(e.target.checked)}
                  className="w-4 h-4 accent-bfab-600"
                />
                <span className="text-sm text-black/80">Add a note to your order</span>
              </label>
              {showOrderNote && (
                <textarea
                  name="orderNote"
                  value={formData.orderNote}
                  onChange={handleInputChange}
                  placeholder="Special instructions, delivery notes, etc."
                  rows={3}
                  className="input-base mt-3 resize-none"
                />
              )}
            </div>

            <div className="border-t border-black/10 pt-8">
              <h2 className="font-display text-2xl text-black mb-4">Payment</h2>
              {!stripePublishableKey ? (
                <div className="rounded-lg border border-bfab-200 bg-bfab-50 p-4 text-sm text-bfab-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Stripe is missing VITE_STRIPE_PUBLISHABLE_KEY.
                </div>
              ) : clientSecret && stripeOptions ? (
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <EmbeddedPaymentForm
                    orderNumber={orderNumber}
                    total={total}
                    clearCart={clearCart}
                    onError={setError}
                    onProcessing={setPlacing}
                    processing={placing}
                  />
                </Elements>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-bfab-200 bg-bfab-50/50 p-6 text-center">
                  <CreditCard className="w-10 h-10 text-bfab-600 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-black mb-1">
                    Payment methods load here
                  </p>
                  <p className="text-xs text-black/60 font-light">
                    Confirm your contact and shipping details, then choose from eligible Stripe
                    payment methods without leaving this page.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-bfab-50 border border-bfab-200 rounded-lg p-3 text-sm text-bfab-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {!clientSecret && (
                <button
                  type="submit"
                  disabled={placing || !stripePublishableKey}
                  className="mt-6 w-full btn-primary text-base py-4"
                >
                  <Lock className="w-4 h-4" />
                  {placing ? 'Loading payment methods…' : `Continue to Payment: $${total.toFixed(2)}`}
                </button>
              )}

              <p className="text-xs text-center text-black/50 mt-4 font-light">
                By placing your order, you agree to our{' '}
                <Link to="/terms" className="text-bfab-600 hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="text-bfab-600 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32 bg-white rounded-2xl shadow-card border border-black/5 p-8">
              <h2 className="font-display text-2xl text-black mb-6">Order summary</h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-auto pr-1">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${item.size || index}`} className="flex gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-bfab-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm text-black mb-0.5 line-clamp-1">
                        {item.name}
                      </h3>
                      {item.size && (
                        <p className="text-[11px] uppercase tracking-widest text-black/50">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-bfab-600 font-medium text-sm mt-1">{item.price}</p>
                      {discountCode && (
                        <p className="text-xs font-semibold text-bfab-700 mt-0.5">
                          Discounted to $1.00 each
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-black">
                        ${(
                          (discountCode ? 1 : parseFloat(item.price.replace('$', ''))) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-4 mb-4">
                <label
                  htmlFor="discount-code"
                  className="block text-xs tracking-[0.18em] uppercase font-semibold text-black mb-2"
                >
                  Discount code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                    <input
                      id="discount-code"
                      type="text"
                      value={discountInput}
                      disabled={Boolean(discountCode)}
                      onChange={(event) => {
                        setDiscountInput(event.target.value);
                        setDiscountError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleDiscountCode();
                        }
                      }}
                      placeholder="Enter code"
                      className="input-base pl-10 disabled:bg-bfab-50 disabled:text-bfab-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDiscountCode}
                    className="px-4 rounded-lg bg-black text-white text-xs tracking-widest uppercase font-semibold hover:bg-bfab-700 transition-colors"
                  >
                    {discountCode ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {discountCode && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-bfab-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {CATRICE_DISCOUNT_CODE} applied — every item is $1.
                  </p>
                )}
                {discountError && (
                  <p className="mt-2 text-sm text-red-600">{discountError}</p>
                )}
              </div>

              <div className="space-y-3 border-t border-black/10 pt-4 text-sm">
                <div className="flex justify-between text-black/80">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
                </div>
                {discountCode && (
                  <div className="flex justify-between text-bfab-700">
                    <span>Discount ({CATRICE_DISCOUNT_CODE})</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/80">
                  <span>Shipping</span>
                  <span className="font-semibold text-bfab-700 uppercase tracking-widest text-xs">
                    Free
                  </span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-black/10">
                  <span className="text-sm tracking-[0.2em] uppercase font-semibold text-black">
                    Total
                  </span>
                  <span className="font-display text-3xl text-bfab-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmbeddedPaymentForm({
  orderNumber,
  total,
  clearCart,
  onError,
  onProcessing,
  processing,
}: {
  orderNumber: string;
  total: number;
  clearCart: () => void;
  onError: (message: string | null) => void;
  onProcessing: (processing: boolean) => void;
  processing: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    onProcessing(true);
    onError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?order=${encodeURIComponent(orderNumber)}`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      onError(result.error.message || 'Payment could not be completed. Please try again.');
      onProcessing(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      clearCart();
      window.location.assign(`/checkout/success?order=${encodeURIComponent(orderNumber)}`);
      return;
    }

    onProcessing(false);
  };

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <PaymentElement />
      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || !elements || processing}
        className="mt-6 w-full btn-primary text-base py-4"
      >
        <Lock className="w-4 h-4" />
        {processing ? 'Processing payment…' : `Pay Now: $${total.toFixed(2)}`}
      </button>
    </div>
  );
}
