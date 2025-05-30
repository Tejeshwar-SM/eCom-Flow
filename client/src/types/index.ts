// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  variants: Variant[];
  inventory: number;
  category: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Variant {
  type: 'color' | 'size';
  name: string;
  value: string;
  stock: number;
}

export interface SelectedVariant {
  type: string;
  value: string;
}

// Customer & Address Types
export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order Types
export interface Order {
  _id?: string;
  orderNumber: string;
  customer: Customer;
  product: OrderProduct;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariants: SelectedVariant[];
  image: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv?: string;
  cardholderName: string;
}

export type OrderStatus = 'pending' | 'approved' | 'declined' | 'failed' | 'refunded';

// Payment Types
export interface PaymentDetails {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface PaymentResult {
  success: boolean;
  result: 'approved' | 'declined' | 'error';
  message: string;
  transactionId?: string;
  errorCode?: string;
  retryAllowed?: boolean;
}

// Form Types
export interface CheckoutFormData {
  customer: Customer;
  paymentInfo: PaymentInfo;
}

export interface ProductSelection {
  product: Product;
  quantity: number;
  selectedVariants: SelectedVariant[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

// Context Types
export interface OrderContextType {
  // Product Selection
  selectedProduct: Product | null;
  quantity: number;
  selectedVariants: SelectedVariant[];
  
  // Order State
  currentOrder: Order | null;
  orderTotal: number;
  
  // Actions
  setProductSelection: (product: Product, quantity: number, variants: SelectedVariant[]) => void;
  updateQuantity: (quantity: number) => void;
  updateVariants: (variants: SelectedVariant[]) => void;
  setCurrentOrder: (order: Order) => void;
  clearOrder: () => void;
  
  // Computed Values
  subtotal: number;
  tax: number;
  total: number;
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Card Types
export interface CardType {
  name: string;
  pattern: RegExp;
  code: string;
  cvvLength: number;
}

// Utility Types
export type TransactionType = 'approved' | 'declined' | 'error';

export interface FormatOptions {
  currency?: string;
  locale?: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface SelectProps extends BaseComponentProps {
  name?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
