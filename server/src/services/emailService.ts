import { createMailtrapTransporter, mailtrapConfig } from '../config/mailtrap';
import { Order } from '../types/order';

export class EmailService {
  private transporter;
  
  constructor() {
    this.transporter = createMailtrapTransporter();
  }
  
  async sendOrderConfirmation(order: Order): Promise<boolean> {
    try {
      const subject = order.payment.transactionStatus === 'approved' 
        ? `Order Confirmation - ${order.orderNumber}`
        : `Order Failed - ${order.orderNumber}`;
        
      const html = this.generateEmailTemplate(order);
      
      await this.transporter.sendMail({
        from: mailtrapConfig.sender,
        to: order.customer.email,
        subject,
        html
      });
      
      console.log(`✅ Email sent successfully for order: ${order.orderNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }
  
  private generateEmailTemplate(order: Order): string {
    const isApproved = order.payment.transactionStatus === 'approved';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: ${isApproved ? '#4CAF50' : '#f44336'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .order-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? 'Order Confirmed' : 'Order Failed'}</h1>
            <p>Order #${order.orderNumber}</p>
          </div>
          
          <div class="content">
            <div class="order-details">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.customer.fullName}</p>
              <p><strong>Email:</strong> ${order.customer.email}</p>
              <p><strong>Phone:</strong> ${order.customer.phone}</p>
              <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.zipCode}</p>
            </div>
            
            <div class="order-details">
              <h3>Product Information</h3>
              <p><strong>Product:</strong> ${order.product.name}</p>
              <p><strong>Quantity:</strong> ${order.product.quantity}</p>
              <p><strong>Price:</strong> $${order.product.price}</p>
              <p><strong>Variants:</strong> ${JSON.stringify(order.product.selectedVariants)}</p>
            </div>
            
            <div class="order-details">
              <h3>Order Total</h3>
              <p><strong>Subtotal:</strong> $${order.totals.subtotal}</p>
              <p><strong>Tax:</strong> $${order.totals.tax}</p>
              <p><strong>Total:</strong> $${order.totals.total}</p>
            </div>
            
            ${isApproved ? 
              '<p style="color: #4CAF50;"><strong>Your order has been confirmed and will be processed shortly.</strong></p>' :
              '<p style="color: #f44336;"><strong>Your order could not be processed. Please try again or contact support.</strong></p>'
            }
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
