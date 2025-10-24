import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  items: Array<{
    id: string;
    name: string;
    price: string;
    image: string;
    quantity: number;
    size?: string;
    category: string;
    sku?: string;
  }>;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    country: string;
  };
  orderNumber: string;
  appliedCouponCode?: string;
  onSuccess?: () => void;
}

// Inner form component that uses Stripe hooks
function CheckoutForm({ items, customerInfo, orderNumber, appliedCouponCode, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Submit the form elements first (required by Stripe)
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setMessage(submitError.message || 'Please check your payment details.');
        setLoading(false);
        return;
      }

      // Step 2: Create/update payment intent with promo code from sidebar
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            unitAmount: Math.round(parseFloat(item.price.replace('$', '')) * 100), // convert to cents
            quantity: item.quantity,
            currency: 'usd',
            sku: item.sku,
            size: item.size,
            category: item.category,
          })),
          promoCode: appliedCouponCode || undefined,
          orderNumber,
          customerInfo,
          currency: 'usd',
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error || !clientSecret) {
        setMessage(error || 'Could not start payment.');
        setLoading(false);
        return;
      }

      // Step 3: Confirm the payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?order=${orderNumber}`,
          receipt_email: customerInfo.email,
        },
      });

      if (confirmError) {
        // This will happen if the payment fails
        setMessage(confirmError.message || 'Payment failed.');
        setLoading(false);
      } else {
        // Payment succeeded - user will be redirected via return_url
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setMessage(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Show applied coupon info */}
      {appliedCouponCode && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-green-900">
            🎟️ Coupon {appliedCouponCode} applied!
          </p>
          <p className="text-xs text-green-700 mt-1">
            Discount will be reflected in the final amount
          </p>
        </div>
      )}

      {/* Payment Element */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Payment Details
        </label>
        <div className="rounded-lg">
          <PaymentElement />
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{message}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-8 py-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Powered by Stripe. Your payment information is secure and encrypted.
      </p>
    </form>
  );
}

// Wrapper component that initializes Elements
export default function StripePaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial client secret (ONLY once - don't re-initialize when coupon changes)
    const initializePayment = async () => {
      try {
        setLoadingSecret(true);
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: props.items.map(item => ({
              id: item.id,
              name: item.name,
              image: item.image,
              unitAmount: Math.round(parseFloat(item.price.replace('$', '')) * 100),
              quantity: item.quantity,
              currency: 'usd',
              sku: item.sku,
              size: item.size,
              category: item.category,
            })),
            // Don't pass coupon here - will be passed at submit time
            promoCode: undefined,
            orderNumber: props.orderNumber,
            customerInfo: props.customerInfo,
            currency: 'usd',
          }),
        });

        const data = await response.json();

        if (data.error || !data.clientSecret) {
          setError(data.error || 'Could not initialize payment.');
          setLoadingSecret(false);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment.');
      } finally {
        setLoadingSecret(false);
      }
    };

    initializePayment();
    // Only re-initialize if items or customer info changes, NOT when coupon changes
  }, [props.items, props.orderNumber, props.customerInfo]);

  if (loadingSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-600">Initializing payment...</span>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <p className="text-red-700 font-medium">Payment initialization failed</p>
        <p className="text-red-600 text-sm mt-1">{error || 'Please try again.'}</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ec4899', // Pink-500
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements 
      stripe={stripePromise} 
      options={options}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}

