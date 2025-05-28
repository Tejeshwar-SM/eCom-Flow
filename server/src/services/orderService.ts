import { ProductModel } from '../models/Product';
import { OrderModel } from '../models/Order';
import { CheckoutRequest, Order, TransactionStatus } from '../types/order';
import { generateOrderNumber } from '../utils/generateOrderId';
import { simulatePayment } from './paymentService';
import { EmailService } from './emailService';
import { createError } from '../middleware/errorHandler';

export class OrderService {
  private emailService: EmailService;
  
  constructor() {
    this.emailService = new EmailService();
  }
  
  async processOrder(checkoutData: CheckoutRequest): Promise<{
    success: boolean;
    orderNumber: string;
    transactionStatus: TransactionStatus;
    message: string;
  }> {
    try {
      // 1. Validate product exists and has inventory
      const product = await ProductModel.findById(checkoutData.product.productId);
      if (!product) {
        throw createError('Product not found', 404);
      }
      
      if (product.inventory < checkoutData.product.quantity) {
        throw createError('Insufficient inventory', 400);
      }
      
      // 2. Calculate totals
      const subtotal = product.price * checkoutData.product.quantity;
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;
      
      // 3. Simulate payment processing
      const paymentResult = simulatePayment(checkoutData.payment.cardNumber);
      
      // 4. Generate order number
      const orderNumber = generateOrderNumber();
      
      // 5. Create order record
      const orderData = {
        orderNumber,
        customer: checkoutData.customer,
        product: {
          productId: checkoutData.product.productId,
          name: product.name,
          price: product.price,
          selectedVariants: checkoutData.product.selectedVariants,
          quantity: checkoutData.product.quantity
        },
        payment: {
          cardNumber: `****-****-****-${checkoutData.payment.cardNumber.slice(-4)}`,
          transactionStatus: paymentResult.transactionStatus,
          transactionId: paymentResult.transactionId
        },
        totals: {
          subtotal,
          tax,
          total
        },
        emailSent: false
      };
      
      const order = new OrderModel(orderData);
      await order.save();
      
      // 6. Update inventory if payment approved
      if (paymentResult.transactionStatus === 'approved') {
        await ProductModel.findByIdAndUpdate(
          checkoutData.product.productId,
          { $inc: { inventory: -checkoutData.product.quantity } }
        );
      }
      
      // 7. Send email notification
      try {
        const emailSent = await this.emailService.sendOrderConfirmation(order as any);
        if (emailSent) {
          await OrderModel.findByIdAndUpdate(order._id, { emailSent: true });
        }
      } catch (emailError) {
        console.error('Email sending failed, but order was created:', emailError);
      }
      
      return {
        success: true,
        orderNumber,
        transactionStatus: paymentResult.transactionStatus,
        message: paymentResult.message
      };
      
    } catch (error) {
      console.error('Order processing failed:', error);
      throw error;
    }
  }
  
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const order = await OrderModel.findOne({ orderNumber });
      return order ? { ...order.toObject(), _id: (order._id as any).toString() } : null;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      throw createError('Failed to fetch order', 500);
    }
  }
  
  async resendOrderEmail(orderNumber: string): Promise<boolean> {
    try {
      const order = await OrderModel.findOne({ orderNumber });
      if (!order) {
        throw createError('Order not found', 404);
      }
      
      const emailSent = await this.emailService.sendOrderConfirmation(order as any);
      if (emailSent) {
        await OrderModel.findByIdAndUpdate(order._id, { emailSent: true });
      }
      
      return emailSent;
    } catch (error) {
      console.error('Failed to resend email:', error);
      throw error;
    }
  }
}
