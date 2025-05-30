import { apiUtils } from '../utils/api';
import { PaymentDetails, PaymentResult, ApiResponse } from '../types/index';

interface PaymentValidationRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentValidationResponse {
  isValid: boolean;
  errors: string[];
  cardType?: string;
}

interface CardType {
  name: string;
  code: string;
}

export const paymentApi = {
  // Process payment
  async processPayment(paymentDetails: PaymentDetails): Promise<ApiResponse<PaymentResult>> {
    return apiUtils.post('/payment/process', paymentDetails);
  },

  // Validate payment details
  async validatePayment(validationData: PaymentValidationRequest): Promise<ApiResponse<PaymentValidationResponse>> {
    return apiUtils.post('/payment/validate', validationData);
  },

  // Get supported card types
  async getCardTypes(): Promise<ApiResponse<CardType[]>> {
    return apiUtils.get('/payment/card-types');
  }
};