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
} from '@react-email/components';

interface ShippingNotificationProps {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  customerName: string;
}

export default function ShippingNotification({
  orderNumber = 'NM-20251026-1234',
  trackingNumber = '9400111899562854367891',
  carrier = 'USPS',
  trackingUrl = 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899562854367891',
  customerName = 'Valued Customer',
}: ShippingNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your NoMatch order {orderNumber} is on its way!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://preneurbank.com/nomatch.png"
              alt="NoMatch"
              width="280"
              height="52"
              style={logo}
            />
          </Section>

          {/* Pink Divider */}
          <Hr style={pinkDivider} />

          {/* Shipping Icon & Message */}
          <Section style={content}>
            <div style={iconContainer}>
              <Text style={shippingIcon}>📦</Text>
            </div>
            <Heading style={h1}>Your Order Has Shipped!</Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Great news! Your NoMatch order is on its way to you. We've handed your package to{' '}
              <strong>{carrier}</strong> for delivery.
            </Text>
          </Section>

          {/* Tracking Box */}
          <Section style={trackingBox}>
            <Text style={trackingLabel}>TRACKING NUMBER</Text>
            <Text style={trackingNumber}>{trackingNumber}</Text>
            
            <Link href={trackingUrl} style={trackButton}>
              Track Your Package
            </Link>
            
            <Text style={trackingCarrier}>Carrier: {carrier}</Text>
          </Section>

          {/* Order Number */}
          <Section style={content}>
            <Text style={orderInfo}>
              <strong>Order Number:</strong> {orderNumber}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Delivery Info */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Delivery Information
            </Heading>
            <Text style={text}>
              Your package is expected to arrive within <strong>7-21 business days</strong>. 
              You can track your shipment anytime using the tracking number above.
            </Text>
            <Text style={text}>
              The tracking information may take a few hours to become active in the carrier's system.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* What's Next */}
          <Section style={content}>
            <Heading as="h2" style={h2}>
              What Happens Next?
            </Heading>
            <ul style={list}>
              <li style={listItem}>📍 Track your package using the link above</li>
              <li style={listItem}>🚚 Carrier will deliver to your address</li>
              <li style={listItem}>📬 Sign for delivery (if required)</li>
              <li style={listItem}>👟 Enjoy your one-of-a-kind NoMatch sneakers!</li>
            </ul>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your delivery? Contact us at{' '}
              <Link href="mailto:support@nomatch.us" style={link}>
                support@nomatch.us
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} NoMatch. Designed to Stand Out.
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
  margin: '20px auto',
  padding: '0',
  maxWidth: '100%',
  width: '100%',
  backgroundColor: '#ffffff',
};

const header = {
  textAlign: 'center' as const,
  padding: '30px 20px 20px',
  backgroundColor: '#ffffff',
};

const logo = {
  margin: '0 auto',
  display: 'block',
  maxWidth: '280px',
  height: 'auto',
  backgroundColor: 'transparent',
};

const pinkDivider = {
  borderColor: '#ec4899',
  borderWidth: '3px',
  borderStyle: 'solid',
  margin: '0',
};

const content = {
  padding: '20px 20px 15px',
};

const iconContainer = {
  textAlign: 'center' as const,
  padding: '20px 0 10px',
};

const shippingIcon = {
  fontSize: '64px',
  margin: '0',
  lineHeight: '1',
};

const h1 = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#111827',
  textAlign: 'center' as const,
  margin: '0 0 20px',
  letterSpacing: '-0.3px',
};

const h2 = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#111827',
  margin: '0 0 16px',
  letterSpacing: '-0.2px',
};

const text = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 14px',
};

const trackingBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '24px 20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const trackingLabel = {
  fontSize: '11px',
  color: '#059669',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
  fontWeight: 700,
  letterSpacing: '1.2px',
  textAlign: 'center' as const,
};

const trackingNumber = {
  fontSize: '20px',
  color: '#111827',
  margin: '0 0 20px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textAlign: 'center' as const,
};

const trackButton = {
  backgroundColor: '#9333ea',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '16px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const trackingCarrier = {
  fontSize: '13px',
  color: '#059669',
  margin: '0',
  fontWeight: 600,
  textAlign: 'center' as const,
};

const orderInfo = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
  borderWidth: '1px',
};

const list = {
  margin: '0',
  padding: '0 0 0 20px',
  listStyle: 'none',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '28px',
  color: '#374151',
  margin: '0 0 8px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '30px 20px 30px',
  backgroundColor: '#f9fafb',
  marginTop: '30px',
};

const footerText = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 8px',
  lineHeight: '20px',
};

const link = {
  color: '#ec4899',
  textDecoration: 'none',
  fontWeight: 600,
};

