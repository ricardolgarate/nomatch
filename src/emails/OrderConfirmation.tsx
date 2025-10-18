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
  Row,
  Column,
} from '@react-email/components';

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  size?: string;
  quantity: number;
  price: string;
  sku?: string;
}

interface OrderConfirmationProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  promoCode?: string;
}

export default function OrderConfirmation({
  orderNumber = 'NM-20251018-5432',
  orderDate = 'October 18, 2025',
  customerName = 'John Doe',
  items = [],
  subtotal = 17000,
  discount = 0,
  shipping = 0,
  total = 17000,
  paymentMethod = 'Card',
  billingAddress = {
    line1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postal_code: '78701',
    country: 'US',
  },
  promoCode,
}: OrderConfirmationProps) {
  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Html>
      <Head />
      <Preview>Your NoMatch order {orderNumber} has been confirmed!</Preview>
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

          {/* Thank You Message */}
          <Section style={content}>
            <Heading style={h1}>Thank You for Your Order!</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              We're excited to let you know that your NoMatch order has been confirmed and is being
              prepared for shipment. Each pair is handcrafted with love in Mexico, making your
              sneakers truly one-of-a-kind.
            </Text>
          </Section>

          {/* Order Details Box */}
          <Section style={orderBox}>
            <Row>
              <Column>
                <Text style={orderLabel}>Order Number</Text>
                <Text style={orderValue}>{orderNumber}</Text>
              </Column>
              <Column align="right">
                <Text style={orderLabel}>Order Date</Text>
                <Text style={orderValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          {/* Order Items */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Order Summary
            </Heading>

            {items.map((item, index) => (
              <Section key={index} style={itemContainer}>
                <Row>
                  <Column style={{ width: '100px' }}>
                    {item.image && (
                      <Img
                        src={item.image}
                        alt={item.name}
                        width="80"
                        height="80"
                        style={itemImage}
                      />
                    )}
                  </Column>
                  <Column style={{ paddingLeft: '16px' }}>
                    <Text style={itemName}>{item.name}</Text>
                    {item.size && (
                      <Text style={itemDetail}>Size: US {item.size}</Text>
                    )}
                    {item.sku && (
                      <Text style={itemDetail}>SKU: {item.sku}</Text>
                    )}
                    <Text style={itemDetail}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column align="right" style={{ verticalAlign: 'top' }}>
                    <Text style={itemPrice}>{item.price}</Text>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Order Totals */}
          <Section style={content}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>{formatCents(subtotal)}</Text>
              </Column>
            </Row>

            {discount > 0 && (
              <Row style={totalRow}>
                <Column>
                  <Text style={discountLabel}>
                    Discount {promoCode && `(${promoCode})`}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={discountValue}>-{formatCents(discount)}</Text>
                </Column>
              </Row>
            )}

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Shipping</Text>
              </Column>
              <Column align="right">
                <Text style={shippingValue}>
                  {shipping === 0 ? 'FREE' : formatCents(shipping)}
                </Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={totalRow}>
              <Column>
                <Text style={grandTotalLabel}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={grandTotalValue}>{formatCents(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Payment & Billing Info */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Payment & Billing
            </Heading>
            
            <Text style={infoLabel}>Payment Method</Text>
            <Text style={infoValue}>{paymentMethod}</Text>

            <Text style={infoLabel}>Billing Address</Text>
            <Text style={infoValue}>
              {billingAddress.line1}
              {billingAddress.line2 && <><br />{billingAddress.line2}</>}
              <br />
              {billingAddress.city}, {billingAddress.state} {billingAddress.postal_code}
              <br />
              {billingAddress.country}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Shipping Info */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Shipping Information
            </Heading>
            <Text style={text}>
              Your order will be delivered within <strong>3-5 business days</strong>. We'll send you
              tracking information as soon as your order ships.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@nomatch.us" style={link}>
                support@nomatch.us
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
  color: '#1f2937',
  textAlign: 'center' as const,
  margin: '0 0 20px',
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

const orderBox = {
  backgroundColor: '#f3e8ff',
  border: '2px solid #d8b4fe',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const orderLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  fontWeight: '600',
  letterSpacing: '0.5px',
};

const orderValue = {
  fontSize: '18px',
  color: '#1f2937',
  margin: '0',
  fontWeight: '700',
};

const itemContainer = {
  padding: '16px 0',
  borderBottom: '1px solid #e5e7eb',
};

const itemImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const itemName = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 8px',
};

const itemDetail = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px',
};

const itemPrice = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#9333ea',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const totalRow = {
  padding: '8px 0',
};

const totalLabel = {
  fontSize: '16px',
  color: '#4b5563',
  margin: '0',
};

const totalValue = {
  fontSize: '16px',
  color: '#1f2937',
  margin: '0',
  fontWeight: '500',
};

const discountLabel = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
};

const discountValue = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
  fontWeight: '600',
};

const shippingValue = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
  fontWeight: '600',
};

const grandTotalLabel = {
  fontSize: '20px',
  color: '#1f2937',
  margin: '0',
  fontWeight: '700',
};

const grandTotalValue = {
  fontSize: '20px',
  color: '#9333ea',
  margin: '0',
  fontWeight: '700',
};

const infoLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '16px 0 4px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const infoValue = {
  fontSize: '15px',
  color: '#1f2937',
  margin: '0 0 16px',
  lineHeight: '22px',
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

