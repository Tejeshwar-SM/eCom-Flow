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
        fullName: orderData.customer.fullName.trim(),
        email: orderData.customer.email.trim().toLowerCase(),
        phone: orderData.customer.phone, // ✅ KEEP INTERNATIONAL FORMAT - DON'T STRIP!
        address: {
          street: orderData.customer.address.street.trim(),
          city: orderData.customer.address.city.trim(),
          state: orderData.customer.address.state.trim(),
          zipCode: orderData.customer.address.zipCode.trim(),
          country: orderData.customer.address.country.trim() || 'India' // ✅ Default to India
        }
      },
      product: {
        productId: orderData.product.productId,
        quantity: orderData.product.quantity,
        selectedVariants: orderData.product.selectedVariants || []
      },
      paymentInfo: {
        cardNumber: orderData.paymentInfo.cardNumber.replace(/\s/g, ''), // Only remove spaces from card
        expiryDate: orderData.paymentInfo.expiryDate.trim(),
        cardholderName: orderData.paymentInfo.cardholderName.trim(),
        cvv: orderData.paymentInfo.cvv.trim()
      },
      transactionResult: orderData.transactionResult
    };

    console.log('🧹 Cleaned order data before sending:', cleanedData);
    console.log('📱 Phone format being sent:', cleanedData.customer.phone);
    
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
