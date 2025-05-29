export interface IProduct {
  // _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  variants: IVariant[];
  inventory: number;
  category: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVariant {
  type: 'color' | 'size';
  name: string;
  value: string;
  stock: number;
}

export interface ICustomer {
  // _id?: string;
  fullName: string;
  email: string;
  phone: string;
  address: IAddress;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder {
  // _id?: string;
  orderNumber: string;
  customer: ICustomer| string; // Use string for customer ID reference
  product: IOrderProduct;
  paymentInfo: IPaymentInfo;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariants: ISelectedVariant[];
  image: string;
}

export interface ISelectedVariant {
  type: string;
  value: string;
}

export interface IPaymentInfo {
  cardNumber: string; // Last 4 digits only
  expiryDate: string;
  cvv?: string; // Never store actual CVV
  cardholderName: string;
}

export type OrderStatus = 'pending' | 'approved' | 'declined' | 'failed' | 'refunded';

export type TransactionResult = 'approved' | 'declined' | 'error';

export interface IEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
