// Application constants
export const APP_CONFIG = {
  APP_NAME: 'Premium Store',
  APP_VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  COMPANY_EMAIL: 'support@ecommerce.com',
  COMPANY_PHONE: '1-800-ECOMMERCE',
} as const;

// Tax rate
export const TAX_RATE = 0.08; // 8%

// Validation constants
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 200,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 10,
} as const;

// Card types
export const CARD_TYPES = [
  { name: 'Visa', pattern: /^4/, cvvLength: 3 },
  { name: 'MasterCard', pattern: /^5[1-5]/, cvvLength: 3 },
  { name: 'American Express', pattern: /^3[47]/, cvvLength: 4 },
  { name: 'Discover', pattern: /^6(?:011|5)/, cvvLength: 3 },
] as const;

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  CART: 'ecommerce_cart',
  USER_PREFERENCES: 'ecommerce_user_preferences',
  RECENT_ORDERS: 'ecommerce_recent_orders',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  CHECKOUT: '/checkout',
  THANK_YOU: '/thank-you',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  ORDERS: '/orders',
  PAYMENT: '/payment',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PAYMENT_DECLINED: 'Your payment was declined. Please try a different card.',
  PAYMENT_ERROR: 'Payment processing failed. Please try again.',
  ORDER_NOT_FOUND: 'Order not found.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  INSUFFICIENT_STOCK: 'Insufficient stock available.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order placed successfully!',
  PAYMENT_APPROVED: 'Payment approved successfully!',
  DATA_SAVED: 'Data saved successfully!',
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CARD_NUMBER: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  EXPIRY_DATE: /^(0[1-9]|1[0-2])\/\d{2}$/,
} as const;

// US States
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
] as const;

// Countries
export const COUNTRIES = [
  'United States',
  'Canada',
] as const;
