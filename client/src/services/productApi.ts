import { apiUtils } from '../utils/api';
import { Product, SelectedVariant, ApiResponse } from '../types/index';

export const productApi = {
  // Get all products
  async getProducts(): Promise<ApiResponse<{ products: Product[]; count: number }>> {
    return apiUtils.get('/products');
  },

  // Get single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return apiUtils.get(`/products/${id}`);
  },

  // Check product availability
  async checkAvailability(
    productId: string,
    quantity: number,
    variants?: SelectedVariant[]
  ): Promise<ApiResponse<{ available: boolean; message?: string }>> {
    return apiUtils.post(`/products/${productId}/check-availability`, {
      quantity,
      variants
    });
  },

  // Update product inventory (internal use)
  async updateInventory(
    productId: string,
    quantity: number,
    operation: 'increase' | 'decrease',
    variants?: SelectedVariant[]
  ): Promise<ApiResponse<any>> {
    return apiUtils.put(`/products/${productId}/inventory`, {
      quantity,
      operation,
      variants
    });
  }
};
