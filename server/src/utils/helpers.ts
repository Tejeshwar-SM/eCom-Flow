import { IOrder, ICustomer } from '../types';

export class Helpers {
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  static sanitizeCardNumber(cardNumber: string): string {
    // Return only last 4 digits
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.slice(-4);
  }

  static maskCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const lastFour = cleanNumber.slice(-4);
    const maskedPortion = '*'.repeat(cleanNumber.length - 4);
    return maskedPortion + lastFour;
  }

  static calculateTax(subtotal: number, taxRate: number = 0.08): number {
    return Math.round(subtotal * taxRate * 100) / 100;
  }

  static calculateTotal(subtotal: number, tax: number): number {
    return Math.round((subtotal + tax) * 100) / 100;
  }

  static formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}${address.country ? `, ${address.country}` : ''}`;
  }

  static generateEmailSubject(type: 'success' | 'failure', orderNumber: string): string {
    const subjects = {
      success: `Order Confirmation - ${orderNumber}`,
      failure: `Order Payment Failed - ${orderNumber}`
    };
    return subjects[type];
  }

  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substr(0, maxLength - 3) + '...';
  }

  static getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  static getBaseUrl(): string {
    return process.env.CLIENT_URL || 'http://localhost:3000';
  }

  static logInfo(message: string, data?: any): void {
    console.log(`ℹ️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static logError(message: string, error?: any): void {
    console.error(`❌ ${message}`, error);
  }

  static logSuccess(message: string, data?: any): void {
    console.log(`✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
