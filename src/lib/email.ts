import nodemailer from 'nodemailer';
import { CartItem } from './stripe';

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
});

export interface OrderData {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount?: number;
  total: number;
  shippingAddress?: any;
  paymentStatus: 'succeeded' | 'failed' | 'pending';
}

// Send order confirmation email
export async function sendOrderConfirmation(orderData: OrderData) {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        ${item.size ? `Size: ${item.size}<br>` : ''}
        Quantity: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.price}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-weight: bold; background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase from NoMatch</p>
        </div>
        
        <div class="content">
          <p>Hi ${orderData.customerName || 'there'},</p>
          <p>Your order has been successfully placed and is being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            
            <h4>Items Ordered:</h4>
            <table>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>$${orderData.subtotal.toFixed(2)}</strong></td>
              </tr>
              ${orderData.discount ? `
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; color: green;"><strong>Discount:</strong></td>
                <td style="padding: 10px; text-align: right; color: green;"><strong>-$${orderData.discount.toFixed(2)}</strong></td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>FREE</strong></td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                <td style="padding: 15px; text-align: right; font-size: 18px; color: #667eea;"><strong>$${orderData.total.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>📧 You'll receive tracking information once your order ships</li>
            <li>📦 Estimated delivery: 3-5 business days</li>
            <li>💬 Questions? Reply to this email or contact our support team</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NoMatch!</p>
          <p>🌐 Visit us at nomatch.com | 📧 support@nomatch.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"NoMatch" <${process.env.SMTP_USER}>`,
    to: orderData.customerEmail,
    subject: `Order Confirmation - ${orderData.orderId}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', orderData.customerEmail);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}

// Send payment failure notification
export async function sendPaymentFailedEmail(orderData: OrderData, errorMessage?: string) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; }
        .retry-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Payment Failed</h1>
          <p>There was an issue processing your payment</p>
        </div>
        
        <div class="content">
          <p>Hi there,</p>
          <p>We were unable to process your payment for order ${orderData.orderId}.</p>
          
          ${errorMessage ? `<p><strong>Reason:</strong> ${errorMessage}</p>` : ''}
          
          <p>Don't worry! Your items are still available. You can try again with a different payment method.</p>
          
          <a href="${process.env.WEBSITE_URL}/checkout" class="retry-button">Try Again</a>
          
          <p>If you continue to have issues, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"NoMatch" <${process.env.SMTP_USER}>`,
    to: orderData.customerEmail,
    subject: `Payment Failed - ${orderData.orderId}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment failed email sent to:', orderData.customerEmail);
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
}

// Send admin notification for failed payments
export async function sendAdminPaymentAlert(orderData: OrderData, errorMessage?: string) {
  const emailHtml = `
    <h2>🚨 Payment Failed Alert</h2>
    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
    <p><strong>Customer:</strong> ${orderData.customerEmail}</p>
    <p><strong>Amount:</strong> $${orderData.total.toFixed(2)}</p>
    <p><strong>Error:</strong> ${errorMessage || 'Unknown error'}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${orderData.items.map(item => `<li>${item.name} (${item.quantity}x) - ${item.price}</li>`).join('')}
    </ul>
  `;

  const mailOptions = {
    from: `"NoMatch System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `🚨 Payment Failed Alert - $${orderData.total.toFixed(2)}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin payment alert sent');
  } catch (error) {
    console.error('Error sending admin payment alert:', error);
  }
}

// Send low inventory alert
export async function sendLowInventoryAlert(productId: string, productName: string, currentStock: number, size?: string) {
  const emailHtml = `
    <h2>📦 Low Inventory Alert</h2>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Product ID:</strong> ${productId}</p>
    ${size ? `<p><strong>Size:</strong> ${size}</p>` : ''}
    <p><strong>Current Stock:</strong> ${currentStock}</p>
    <p>This product is running low. Consider restocking soon.</p>
  `;

  const mailOptions = {
    from: `"NoMatch Inventory" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `📦 Low Inventory: ${productName}`,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Low inventory alert sent for:', productName);
  } catch (error) {
    console.error('Error sending low inventory alert:', error);
  }
}
