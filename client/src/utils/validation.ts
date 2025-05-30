import { Customer, PaymentInfo, FormErrors } from '../types/index';

export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation (US format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // ZIP code validation
  static isValidZipCode(zipCode: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  // Credit card number validation (Luhn algorithm)
  static isValidCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    return this.luhnCheck(cleanNumber);
  }

  // Luhn algorithm implementation
  private static luhnCheck(cardNumber: string): boolean {
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

  // Credit card expiry validation
  static isValidExpiryDate(expiryDate: string): boolean {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    return expiry > now;
  }

  // CVV validation
  static isValidCVV(cvv: string, cardType?: string): boolean {
    const expectedLength = cardType === 'amex' ? 4 : 3;
    const cvvRegex = new RegExp(`^\\d{${expectedLength}}$`);
    return cvvRegex.test(cvv);
  }

  // Customer data validation
  static validateCustomer(customer: Partial<Customer>): FormErrors {
    const errors: FormErrors = {};

    // Full name validation
    if (!customer.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    } else if (customer.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (customer.fullName.trim().length > 100) {
      errors.fullName = 'Full name cannot exceed 100 characters';
    }

    // Email validation
    if (!customer.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(customer.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!customer.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!this.isValidPhone(customer.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!customer.address) {
      errors.address = 'Address is required';
    } else {
      if (!customer.address.street?.trim()) {
        errors['address.street'] = 'Street address is required';
      } else if (customer.address.street.trim().length < 5) {
        errors['address.street'] = 'Street address must be at least 5 characters';
      }

      if (!customer.address.city?.trim()) {
        errors['address.city'] = 'City is required';
      } else if (customer.address.city.trim().length < 2) {
        errors['address.city'] = 'City must be at least 2 characters';
      }

      if (!customer.address.state?.trim()) {
        errors['address.state'] = 'State is required';
      } else if (customer.address.state.trim().length < 2) {
        errors['address.state'] = 'State must be at least 2 characters';
      }

      if (!customer.address.zipCode?.trim()) {
        errors['address.zipCode'] = 'ZIP code is required';
      } else if (!this.isValidZipCode(customer.address.zipCode)) {
        errors['address.zipCode'] = 'Please enter a valid ZIP code';
      }
    }

    return errors;
  }

  // Payment info validation
  static validatePaymentInfo(paymentInfo: Partial<PaymentInfo>): FormErrors {
    const errors: FormErrors = {};

    // Card number validation
    if (!paymentInfo.cardNumber?.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!this.isValidCardNumber(paymentInfo.cardNumber)) {
      errors.cardNumber = 'Please enter a valid card number';
    }

    // Expiry date validation
    if (!paymentInfo.expiryDate?.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!this.isValidExpiryDate(paymentInfo.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    // CVV validation
    if (!paymentInfo.cvv?.trim()) {
      errors.cvv = 'CVV is required';
    } else {
      const cardType = this.getCardType(paymentInfo.cardNumber || '');
      if (!this.isValidCVV(paymentInfo.cvv, cardType)) {
        errors.cvv = `CVV must be ${cardType === 'amex' ? '4' : '3'} digits`;
      }
    }

    // Cardholder name validation
    if (!paymentInfo.cardholderName?.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    } else if (paymentInfo.cardholderName.trim().length < 2) {
      errors.cardholderName = 'Cardholder name must be at least 2 characters';
    } else if (paymentInfo.cardholderName.trim().length > 100) {
      errors.cardholderName = 'Cardholder name cannot exceed 100 characters';
    }

    return errors;
  }

  // Get card type from card number
  static getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    
    return 'unknown';
  }

  // Format card number with spaces
  static formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const cardType = this.getCardType(cleanNumber);
    
    // American Express: 4-6-5 format
    if (cardType === 'amex') {
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    // Others: 4-4-4-4 format
    return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  // Format expiry date
  static formatExpiryDate(input: string): string {
    const cleanInput = input.replace(/\D/g, '');
    
    if (cleanInput.length >= 2) {
      return cleanInput.substring(0, 2) + (cleanInput.length > 2 ? '/' + cleanInput.substring(2, 4) : '');
    }
    
    return cleanInput;
  }

  // Format phone number
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }
}
