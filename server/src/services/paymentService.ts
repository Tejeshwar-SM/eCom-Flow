import { TransactionStatus } from '../types/order';
import { generateTransactionId } from '../utils/generateOrderId';

export interface PaymentResult {
  transactionStatus: TransactionStatus;
  transactionId: string;
  message: string;
}

export const simulatePayment = (cardNumber: string): PaymentResult => {
  const lastDigit = parseInt(cardNumber.slice(-1));
  const transactionId = generateTransactionId();
  
  // Simulation logic based on last digit
  if (lastDigit <= 6) {
    return {
      transactionStatus: 'approved',
      transactionId,
      message: 'Payment processed successfully'
    };
  } else if (lastDigit <= 8) {
    return {
      transactionStatus: 'declined',
      transactionId,
      message: 'Payment declined by bank'
    };
  } else {
    return {
      transactionStatus: 'error',
      transactionId,
      message: 'Payment gateway error occurred'
    };
  }
};
