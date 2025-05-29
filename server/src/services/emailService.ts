import nodemailer from 'nodemailer';
import { IOrder, ICustomer } from '../types';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT || '2525'),
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });
  }

  async sendOrderConfirmation(order: IOrder, customer: ICustomer): Promise<void> {
    const subject = `Order Confirmation - ${order.orderNumber}`;
    
    const html = this.generateSuccessEmailHTML(order, customer);
    const text = this.generateSuccessEmailText(order, customer);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to: customer.email,
      subject,
      html,
      text
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation email sent to ${customer.email}`);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      throw error;
    }
  }

  async sendOrderFailure(order: IOrder, customer: ICustomer, reason: string): Promise<void> {
    const subject = `Order Payment Failed - ${order.orderNumber}`;
    
    const html = this.generateFailureEmailHTML(order, customer, reason);
    const text = this.generateFailureEmailText(order, customer, reason);

    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
      to: customer.email,
      subject,
      html,
      text
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order failure email sent to ${customer.email}`);
    } catch (error) {
      console.error('❌ Failed to send failure email:', error);
      throw error;
    }
  }

  private generateSuccessEmailHTML(order: IOrder, customer: ICustomer): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .total { font-size: 18px; font-weight: bold; color: #3B82F6; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="content">
            <p>Hi ${customer.fullName},</p>
            <p>Your order has been successfully processed and confirmed.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Product:</strong> ${order.product.name}</p>
              <p><strong>Quantity:</strong> ${order.product.quantity}</p>
              <p><strong>Price:</strong> $${order.product.price.toFixed(2)}</p>
              ${order.product.selectedVariants.length > 0 ? 
                `<p><strong>Variants:</strong> ${order.product.selectedVariants.map(v => `${v.type}: ${v.value}`).join(', ')}</p>` 
                : ''
              }
              <hr>
              <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
              <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
              <p class="total">Total: $${order.total.toFixed(2)}</p>
            </div>
            
            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>
                ${customer.fullName}<br>
                ${customer.address.street}<br>
                ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}<br>
                ${customer.address.country}
              </p>
            </div>
            
            <p>You will receive a shipping confirmation email once your order is dispatched.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateFailureEmailHTML(order: IOrder, customer: ICustomer, reason: string): string {
    const reasonText = reason === 'declined' ? 'Your payment was declined by your bank.' :
                      reason === 'error' ? 'There was a technical error processing your payment.' :
                      'Payment processing failed.';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Payment Failed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .retry-button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
            <p>We couldn't process your order</p>
          </div>
          
          <div class="content">
            <p>Hi ${customer.fullName},</p>
            <p>Unfortunately, we were unable to process your payment for order ${order.orderNumber}.</p>
            <p><strong>Reason:</strong> ${reasonText}</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Product:</strong> ${order.product.name}</p>
              <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            
            <p>Don't worry! You can try again by visiting our website and placing a new order.</p>
            <a href="${process.env.CLIENT_URL}" class="retry-button">Try Again</a>
            
            <p>If you continue to experience issues, please contact our support team for assistance.</p>
          </div>
          
          <div class="footer">
            <p>We apologize for any inconvenience.</p>
            <p>Support Email: support@ecommerce.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSuccessEmailText(order: IOrder, customer: ICustomer): string {
    return `
      Order Confirmation - ${order.orderNumber}
      
      Hi ${customer.fullName},
      
      Your order has been successfully processed and confirmed.
      
      Order Details:
      - Order Number: ${order.orderNumber}
      - Product: ${order.product.name}
      - Quantity: ${order.product.quantity}
      - Total: $${order.total.toFixed(2)}
      
      Shipping Address:
      ${customer.fullName}
      ${customer.address.street}
      ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}
      ${customer.address.country}
      
      Thank you for shopping with us!
    `;
  }

  private generateFailureEmailText(order: IOrder, customer: ICustomer, reason: string): string {
    return `
      Payment Failed - ${order.orderNumber}
      
      Hi ${customer.fullName},
      
      Unfortunately, we were unable to process your payment for order ${order.orderNumber}.
      
      Reason: ${reason}
      
      Order Details:
      - Order Number: ${order.orderNumber}
      - Product: ${order.product.name}
      - Total: $${order.total.toFixed(2)}
      
      You can try again by visiting our website.
      
      If you continue to experience issues, please contact our support team.
    `;
  }
}

export const emailService = new EmailService();
