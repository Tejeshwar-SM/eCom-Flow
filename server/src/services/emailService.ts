import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { IOrder, ICustomer } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      const requiredEnvVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('❌ Missing email environment variables:', missingVars);
        return;
      }

      console.log('📧 Initializing email service with:');
      console.log('   Host:', process.env.MAIL_HOST);
      console.log('   Port:', process.env.MAIL_PORT);
      console.log('   Username:', process.env.MAIL_USERNAME);

      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '2525'),
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        },
        debug: false, // Set to true for debugging
        logger: false // Set to true for debugging
      });

      this.verifyConnection();
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      console.error('❌ Email transporter not initialized');
      return;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully to Mailtrap');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      this.initialized = false;
    }
  }

  async sendOrderConfirmation(order: IOrder, customer: ICustomer): Promise<void> {
    if (!this.initialized || !this.transporter) {
      throw new Error('Email service not properly initialized. Check your email configuration.');
    }

    const subject = `Order Confirmation - ${order.orderNumber}`;
    const html = await this.renderTemplate('emailSuccess.html', order, customer);
    const text = this.generatePlainText(order, customer, 'success');

    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to: customer.email,
      subject,
      html,
      text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${customer.email}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      throw error;
    }
  }

  async sendOrderFailure(order: IOrder, customer: ICustomer, reason: string): Promise<void> {
    if (!this.initialized || !this.transporter) {
      throw new Error('Email service not properly initialized. Check your email configuration.');
    }

    const subject = `Order Payment Failed - ${order.orderNumber}`;
    const html = await this.renderTemplate('emailFailure.html', order, customer, reason);
    const text = this.generatePlainText(order, customer, 'failure', reason);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to: customer.email,
      subject,
      html,
      text
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order failure email sent to ${customer.email}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Failed to send failure email:', error);
      throw error;
    }
  }

  private async renderTemplate(
    templateName: string, 
    order: IOrder, 
    customer: ICustomer, 
    reason?: string
  ): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../templates', templateName);
      let template = fs.readFileSync(templatePath, 'utf8');

      // Get customer object (handle both string ID and full object)
      const customerObj = typeof order.customer === 'string' ? customer : order.customer;

      // Format variants
      const variants = order.product.selectedVariants.length > 0 
        ? order.product.selectedVariants.map(v => `${v.type}: ${v.value}`).join(', ')
        : '';

      // Create variants section HTML (conditional rendering)
      const variantsSection = variants ? `
                    <div class="variants">
                        <strong>Selected Options:</strong> ${variants}
                    </div>` : '';

      // Format address
      const address = `${customerObj.address.street}<br>
        ${customerObj.address.city}, ${customerObj.address.state} ${customerObj.address.zipCode}<br>
        ${customerObj.address.country}`;

      // Format date
      const orderDate = new Date(order.createdAt || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Format reason for failure emails
      const failureReason = reason === 'declined' 
        ? 'Your payment was declined by your bank.' 
        : reason === 'error' 
        ? 'There was a technical error processing your payment.' 
        : reason || 'Payment processing failed.';

      // Prepare template variables
      const variables = {
        customerName: customerObj.fullName,
        customerEmail: customerObj.email,
        orderNumber: order.orderNumber,
        orderDate: orderDate,
        productName: order.product.name,
        quantity: order.product.quantity.toString(),
        unitPrice: order.product.price.toFixed(2),
        variants: variants, // Keep for backward compatibility
        variantsSection: variantsSection, // New conditional section
        subtotal: order.subtotal.toFixed(2),
        tax: order.tax.toFixed(2),
        total: order.total.toFixed(2),
        address: address,
        websiteUrl: process.env.CLIENT_URL || 'http://localhost:3000',
        failureReason: failureReason
      };

      // Replace all template variables
      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      }

      return template;
    } catch (error) {
      console.error(`❌ Error rendering template ${templateName}:`, error);
      throw new Error(`Failed to render email template: ${templateName}`);
    }
  }

  private generatePlainText(
    order: IOrder, 
    customer: ICustomer, 
    type: 'success' | 'failure', 
    reason?: string
  ): string {
    const customerObj = typeof order.customer === 'string' ? customer : order.customer;

    if (type === 'success') {
      const variants = order.product.selectedVariants.length > 0 
        ? `\n- Selected Options: ${order.product.selectedVariants.map(v => `${v.type}: ${v.value}`).join(', ')}`
        : '';

      return `
Order Confirmation - ${order.orderNumber}

Hi ${customerObj.fullName},

Your order has been successfully confirmed!

Order Details:
- Order Number: ${order.orderNumber}
- Product: ${order.product.name}
- Quantity: ${order.product.quantity}${variants}
- Total: $${order.total.toFixed(2)}

Shipping Address:
${customerObj.fullName}
${customerObj.address.street}
${customerObj.address.city}, ${customerObj.address.state} ${customerObj.address.zipCode}
${customerObj.address.country}

Thank you for shopping with us!
      `.trim();
    } else {
      return `
Payment Failed - ${order.orderNumber}

Hi ${customerObj.fullName},

Unfortunately, we were unable to process your payment for order ${order.orderNumber}.

Reason: ${reason || 'Payment processing failed'}

Order Details:
- Order Number: ${order.orderNumber}
- Product: ${order.product.name}
- Total: $${order.total.toFixed(2)}

You can try again by visiting our website: ${process.env.CLIENT_URL}

If you continue to experience issues, please contact our support team.
      `.trim();
    }
  }
}

export const emailService = new EmailService();
