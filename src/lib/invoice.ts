import { Order } from '../firebase/orders';

export interface InvoiceData {
  invoiceNumber: string;
  order: Order;
  companyInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email: string;
    website: string;
  };
}

// Generate invoice HTML
export function generateInvoiceHTML(invoiceData: InvoiceData): string {
  const { order, companyInfo, invoiceNumber } = invoiceData;
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.size || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${item.price}</td>
      <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
        .company-info { text-align: left; }
        .invoice-info { text-align: right; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .customer-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .final-total { font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-succeeded { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-pending { background: #fff3cd; color: #856404; }
        .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1 style="margin: 0; color: #667eea; font-size: 24px;">${companyInfo.name}</h1>
            <p style="margin: 5px 0;">${companyInfo.address}</p>
            <p style="margin: 5px 0;">${companyInfo.city}, ${companyInfo.state} ${companyInfo.zip}</p>
            <p style="margin: 5px 0;">Email: ${companyInfo.email}</p>
            <p style="margin: 5px 0;">Website: ${companyInfo.website}</p>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
            <p><strong>Status:</strong> 
              <span class="status status-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="customer-info">
          <h3 style="margin-top: 0; color: #667eea;">Bill To:</h3>
          <p><strong>${order.customerName || 'Customer'}</strong></p>
          <p>${order.customerEmail}</p>
          ${order.shippingAddress ? `
            <p>${order.shippingAddress.line1}</p>
            ${order.shippingAddress.line2 ? `<p>${order.shippingAddress.line2}</p>` : ''}
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}</p>
            <p>${order.shippingAddress.country}</p>
          ` : ''}
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Size</th>
              <th style="text-align: center;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.discount ? `
          <div class="total-row" style="color: green;">
            <span>Discount:</span>
            <span>-$${order.discount.toFixed(2)}</span>
          </div>` : ''}
          <div class="total-row">
            <span>Shipping:</span>
            <span>FREE</span>
          </div>
          <div class="total-row final-total">
            <span>Total:</span>
            <span>$${order.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>For questions about this invoice, contact us at ${companyInfo.email}</p>
          <p style="font-size: 12px; color: #999;">
            This is a computer-generated invoice. No signature required.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send invoice email
export async function sendInvoiceEmail(order: Order, invoiceHtml: string) {
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"NoMatch" <${process.env.SMTP_USER}>`,
    to: order.customerEmail,
    subject: `Invoice for Order ${order.id}`,
    html: invoiceHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invoice email sent to:', order.customerEmail);
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

// Generate and send invoice
export async function generateAndSendInvoice(order: Order): Promise<string> {
  const invoiceNumber = `INV-${order.id}-${Date.now()}`;
  
  const invoiceData: InvoiceData = {
    invoiceNumber,
    order,
    companyInfo: {
      name: 'NoMatch',
      address: '123 Fashion Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      email: 'support@nomatch.com',
      website: 'www.nomatch.com',
    },
  };

  const invoiceHtml = generateInvoiceHTML(invoiceData);
  
  // Send invoice email
  await sendInvoiceEmail(order, invoiceHtml);
  
  return invoiceNumber;
}
