import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentFailedProps {
  orderNumber: string;
  customerName: string;
  reason: string;
  total: number;
}

export default function PaymentFailed({
  orderNumber = 'NM-20251018-5432',
  customerName = 'John Doe',
  reason = 'Your card was declined.',
  total = 17000,
}: PaymentFailedProps) {
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Html>
      <Head />
      <Preview>Payment failed for order {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://nomatch.vercel.app/Logo-NoMatch.webp"
              alt="NoMatch"
              width="180"
              height="60"
              style={logo}
            />
          </Section>

          {/* Alert Box */}
          <Section style={alertBox}>
            <Heading style={h1}>Payment Failed</Heading>
            <Text style={alertText}>
              We were unable to process your payment for order {orderNumber}.
            </Text>
          </Section>

          {/* Details */}
          <Section style={content}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Unfortunately, your payment of <strong>{formatCents(total)}</strong> could not be
              processed.
            </Text>

            <Section style={reasonBox}>
              <Text style={reasonLabel}>Reason:</Text>
              <Text style={reasonText}>{reason}</Text>
            </Section>

            <Text style={text}>
              Don't worry! Your order is still saved and you can complete it by visiting our
              website and trying a different payment method.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* What's Next */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              What's Next?
            </Heading>
            <Text style={text}>
              • <strong>Update your payment method</strong> and try again
              <br />
              • <strong>Check your card details</strong> are correct
              <br />
              • <strong>Contact your bank</strong> if the issue persists
              <br />
              • <strong>Use a different payment method</strong>
            </Text>

            <Section style={buttonContainer}>
              <Link href="https://nomatch.us/checkout" style={button}>
                Complete Your Order
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help?{' '}
              <Link href="mailto:support@nomatch.us" style={link}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} NoMatch. Made with love in Mexico.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#fdf2f8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0 30px',
  borderBottom: '3px solid #ec4899',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '20px 0',
};

const h1 = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#dc2626',
  textAlign: 'center' as const,
  margin: '0 0 12px',
};

const h2 = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px',
};

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4b5563',
  margin: '0 0 16px',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const alertText = {
  fontSize: '16px',
  color: '#991b1b',
  margin: '0',
};

const reasonBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
};

const reasonLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const reasonText = {
  fontSize: '15px',
  color: '#1f2937',
  margin: '0',
  fontWeight: '500',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#ec4899',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  display: 'inline-block',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '30px 0 20px',
  borderTop: '1px solid #e5e7eb',
  marginTop: '40px',
};

const footerText = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0 0 8px',
};

const link = {
  color: '#ec4899',
  textDecoration: 'underline',
};

