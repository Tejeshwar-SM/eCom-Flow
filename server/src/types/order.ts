import { Customer, PaymentInfo } from './customer';

export type TransactionStatus = 'approved' | 'declined' | 'error';

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  product: {
    productId: string;
    name: string;
    price: number;
    selectedVariants: Record<string, string>;
    quantity: number;
  };
  payment: {
    cardNumber: string; // last 4 digits only
    transactionStatus: TransactionStatus;
    transactionId: string;
  };
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutRequest {
  customer: Customer;
  payment: PaymentInfo;
  product: {
    productId: string;
    selectedVariants: Record<string, string>;
    quantity: number;
  };
}

export interface CheckoutResponse {
  success: boolean;
  orderNumber?: string;
  transactionStatus: TransactionStatus;
  message: string;
}
