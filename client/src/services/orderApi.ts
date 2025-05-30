import { apiUtils } from '../utils/api';
import { Order, Customer, PaymentInfo, SelectedVariant, ApiResponse } from '../types/index';

interface CreateOrderRequest {
  customer: Customer;
  product: {
    productId: string;
    quantity: number;
    selectedVariants?: SelectedVariant[];
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
    cvv: string;
  };
  transactionResult: 'approved' | 'declined' | 'error';
}

export const orderApi = {
  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<{ orderNumber: string; status: string; total: number }>> {
    // Clean the data before sending to match server validation expectations
    const cleanedData = {
      customer: {
        fullName: orderData.customer.fullName,
        email: orderData.customer.email,
        phone: orderData.customer.phone.replace(/\D/g, ''), // Remove all non-digits
        address: {
          street: orderData.customer.address.street,
          city: orderData.customer.address.city,
          state: orderData.customer.address.state,
          zipCode: orderData.customer.address.zipCode,
          country: orderData.customer.address.country || 'United States'
        }
      },
      product: {
        productId: orderData.product.productId,
        quantity: orderData.product.quantity,
        selectedVariants: orderData.product.selectedVariants || []
      },
      paymentInfo: {
        cardNumber: orderData.paymentInfo.cardNumber.replace(/\s/g, ''), // Remove spaces
        expiryDate: orderData.paymentInfo.expiryDate,
        cardholderName: orderData.paymentInfo.cardholderName,
        cvv: orderData.paymentInfo.cvv
      },
      transactionResult: orderData.transactionResult
    };

    console.log('🧹 Cleaned order data before sending:', cleanedData);
    return apiUtils.post('/orders', cleanedData);
  },

  // Get all orders
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    return apiUtils.get('/orders');
  },

  // Get order by order number
  async getOrder(orderNumber: string): Promise<ApiResponse<Order>> {
    return apiUtils.get(`/orders/${orderNumber}`);
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    return apiUtils.get(`/orders/id/${orderId}`);
  },

  // Update order status (admin function)
  async updateOrderStatus(
    orderNumber: string,
    status: 'pending' | 'approved' | 'declined' | 'failed' | 'refunded'
  ): Promise<ApiResponse<any>> {
    return apiUtils.put(`/orders/${orderNumber}/status`, { status });
  }
};