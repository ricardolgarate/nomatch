import * as React from 'react';
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
              src="https://preneurbank.com/Logo-NoMatch.webp"
              alt="NoMatch"
              width="300"
              height="100"
              style={logo}
            />
          </Section>

          {/* Pink Divider */}
          <Hr style={pinkDivider} />

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
              <Column style={{width: '50%'}}>
                <Text style={orderLabel}>ORDER NUMBER</Text>
                <Text style={orderValue}>{orderNumber}</Text>
              </Column>
              <Column align="right" style={{width: '50%'}}>
                <Text style={orderLabel}>ORDER DATE</Text>
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
                  <Column style={{ width: '120px', verticalAlign: 'top' }}>
                    {item.image && (
                      <Img
                        src={item.image}
                        alt={item.name}
                        width="100"
                        height="100"
                        style={itemImage}
                      />
                    )}
                  </Column>
                  <Column style={{ paddingLeft: '20px', verticalAlign: 'top' }}>
                    <Text style={itemName}>{item.name}</Text>
                    {item.size && (
                      <Text style={itemDetail}>Size: US {item.size}</Text>
                    )}
                    <Text style={itemDetail}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column align="right" style={{ verticalAlign: 'top', width: '100px' }}>
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
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '40px auto',
  padding: '0',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const header = {
  textAlign: 'center' as const,
  padding: '40px 20px 30px',
  backgroundColor: '#ffffff',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const pinkDivider = {
  borderColor: '#ec4899',
  borderWidth: '3px',
  borderStyle: 'solid',
  margin: '0',
};

const content = {
  padding: '30px 40px 20px',
};

const h1 = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#111827',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  letterSpacing: '-0.5px',
};

const h2 = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 20px',
  letterSpacing: '-0.3px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
};

const orderBox = {
  backgroundColor: '#f3e8ff',
  border: '2px solid #e9d5ff',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 40px',
};

const orderLabel = {
  fontSize: '11px',
  color: '#6b7280',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
  fontWeight: '600',
  letterSpacing: '1px',
};

const orderValue = {
  fontSize: '20px',
  color: '#111827',
  margin: '0',
  fontWeight: '700',
  letterSpacing: '-0.3px',
};

const itemContainer = {
  padding: '20px 0',
  borderBottom: '1px solid #f3f4f6',
};

const itemImage = {
  borderRadius: '12px',
  border: '2px solid #f3f4f6',
  objectFit: 'cover' as const,
};

const itemName = {
  fontSize: '17px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
  lineHeight: '24px',
};

const itemDetail = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px',
  lineHeight: '20px',
};

const itemPrice = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#9333ea',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '28px 40px',
  borderWidth: '1px',
};

const totalRow = {
  padding: '10px 0',
};

const totalLabel = {
  fontSize: '16px',
  color: '#374151',
  margin: '0',
  fontWeight: '500',
};

const totalValue = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
  fontWeight: '600',
};

const discountLabel = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
  fontWeight: '600',
};

const discountValue = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
  fontWeight: '700',
};

const shippingValue = {
  fontSize: '16px',
  color: '#059669',
  margin: '0',
  fontWeight: '700',
};

const grandTotalLabel = {
  fontSize: '22px',
  color: '#111827',
  margin: '0',
  fontWeight: '700',
  letterSpacing: '-0.3px',
};

const grandTotalValue = {
  fontSize: '22px',
  color: '#9333ea',
  margin: '0',
  fontWeight: '700',
  letterSpacing: '-0.3px',
};

const infoLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '20px 0 8px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const infoValue = {
  fontSize: '15px',
  color: '#111827',
  margin: '0 0 16px',
  lineHeight: '24px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '40px 20px 40px',
  backgroundColor: '#f9fafb',
  marginTop: '40px',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 10px',
  lineHeight: '20px',
};

const link = {
  color: '#ec4899',
  textDecoration: 'none',
  fontWeight: '600',
};

