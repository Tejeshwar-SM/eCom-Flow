import { ICustomer, IPaymentInfo } from '../types';

export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  }

  static isValidZipCode(zipCode: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  static isValidCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Check if it's all digits and proper length
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    // Luhn algorithm validation
    return this.validateLuhn(cleanNumber);
  }

  static isValidExpiryDate(expiryDate: string): boolean {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    return expiry > now;
  }

  static isValidCVV(cvv: string, cardType?: string): boolean {
    const expectedLength = cardType === 'amex' ? 4 : 3;
    const cvvRegex = new RegExp(`^\\d{${expectedLength}}$`);
    return cvvRegex.test(cvv);
  }

  static validateCustomerData(customer: Partial<ICustomer>): string[] {
    const errors: string[] = [];

    if (!customer.fullName || customer.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    if (!customer.email || !this.isValidEmail(customer.email)) {
      errors.push('Valid email address is required');
    }

    if (!customer.phone || !this.isValidPhone(customer.phone)) {
      errors.push('Valid phone number is required');
    }

    if (!customer.address) {
      errors.push('Address is required');
    } else {
      if (!customer.address.street || customer.address.street.trim().length < 5) {
        errors.push('Street address must be at least 5 characters');
      }

      if (!customer.address.city || customer.address.city.trim().length < 2) {
        errors.push('City must be at least 2 characters');
      }

      if (!customer.address.state || customer.address.state.trim().length < 2) {
        errors.push('State must be at least 2 characters');
      }

      if (!customer.address.zipCode || !this.isValidZipCode(customer.address.zipCode)) {
        errors.push('Valid zip code is required');
      }
    }

    return errors;
  }

  static validatePaymentInfo(paymentInfo: Partial<IPaymentInfo>): string[] {
    const errors: string[] = [];

    if (!paymentInfo.cardNumber || !this.isValidCardNumber(paymentInfo.cardNumber)) {
      errors.push('Valid card number is required');
    }

    if (!paymentInfo.expiryDate || !this.isValidExpiryDate(paymentInfo.expiryDate)) {
      errors.push('Valid expiry date is required');
    }

    if (!paymentInfo.cardholderName || paymentInfo.cardholderName.trim().length < 2) {
      errors.push('Cardholder name must be at least 2 characters');
    }

    return errors;
  }

  private static validateLuhn(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }
}
