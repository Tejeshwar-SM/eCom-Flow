import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import { Country } from 'country-state-city';
import { Customer, PaymentInfo, FormErrors } from '../types/index';

export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // International phone validation
  static isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return false;
    
    try {
      return isValidPhoneNumber(phone);
    } catch (error) {
      return false;
    }
  }

  // Get phone country code
  static getPhoneCountryCode(phone: string): string | undefined {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone);
      return phoneNumber?.country;
    } catch (error) {
      return undefined;
    }
  }

  // Format phone number
  static formatPhoneNumber(phone: string): string {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone);
      return phoneNumber?.formatInternational() || phone;
    } catch (error) {
      return phone;
    }
  }

  // International postal code validation
  static isValidPostalCode(postalCode: string, countryCode?: string): boolean {
    if (!postalCode || postalCode.trim() === '') return false;
    
    const cleanCode = postalCode.trim().toUpperCase();
    
    // Country-specific postal code patterns
    const patterns: { [key: string]: RegExp } = {
      // India - PIN codes
      'IN': /^\d{6}$/,
      
      // United States - ZIP codes
      'US': /^\d{5}(-\d{4})?$/,
      
      // Canada - Postal codes
      'CA': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
      
      // United Kingdom - Postcodes
      'GB': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
      
      // Australia - Postcodes
      'AU': /^\d{4}$/,
      
      // Germany - Postleitzahl
      'DE': /^\d{5}$/,
      
      // France - Code postal
      'FR': /^\d{5}$/,
      
      // Japan - Postal codes
      'JP': /^\d{3}-\d{4}$/,
      
      // Brazil - CEP
      'BR': /^\d{5}-?\d{3}$/,
      
      // Netherlands - Postcodes
      'NL': /^\d{4}\s?[A-Z]{2}$/,
      
      // Spain - Postal codes
      'ES': /^\d{5}$/,
      
      // Italy - CAP
      'IT': /^\d{5}$/,
      
      // China - Postal codes
      'CN': /^\d{6}$/,
      
      // South Korea - Postal codes
      'KR': /^\d{5}$/,
      
      // Russia - Postal codes
      'RU': /^\d{6}$/,
      
      // Mexico - Postal codes
      'MX': /^\d{5}$/,
      
      // Argentina - Postal codes
      'AR': /^[A-Z]?\d{4}[A-Z]{3}$/,
      
      // South Africa - Postal codes
      'ZA': /^\d{4}$/,
      
      // Switzerland - Postal codes
      'CH': /^\d{4}$/,
      
      // Sweden - Postal codes
      'SE': /^\d{3}\s?\d{2}$/,
      
      // Norway - Postal codes
      'NO': /^\d{4}$/,
      
      // Denmark - Postal codes
      'DK': /^\d{4}$/,
      
      // Finland - Postal codes
      'FI': /^\d{5}$/,
      
      // Belgium - Postal codes
      'BE': /^\d{4}$/,
      
      // Austria - Postal codes
      'AT': /^\d{4}$/,
    };
    
    if (countryCode && patterns[countryCode]) {
      return patterns[countryCode].test(cleanCode);
    }
    
    // Generic validation for unknown countries (alphanumeric, 3-10 chars)
    return /^[A-Z0-9\s-]{3,10}$/.test(cleanCode);
  }

  // Get country code from country name
  static getCountryCode(countryName: string): string | undefined {
    const countries = Country.getAllCountries();
    const country = countries.find(c => c.name === countryName);
    return country?.isoCode;
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

  // Customer data validation with international support
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

    // International phone validation
    if (!customer.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!this.isValidPhone(customer.phone)) {
      errors.phone = 'Please enter a valid phone number with country code';
    }

    // Address validation
    if (!customer.address) {
      errors.address = 'Address is required';
    } else {
      // Country validation
      if (!customer.address.country?.trim()) {
        errors['address.country'] = 'Country is required';
      }

      // Street address validation
      if (!customer.address.street?.trim()) {
        errors['address.street'] = 'Street address is required';
      } else if (customer.address.street.trim().length < 5) {
        errors['address.street'] = 'Street address must be at least 5 characters';
      }

      // City validation
      if (!customer.address.city?.trim()) {
        errors['address.city'] = 'City is required';
      } else if (customer.address.city.trim().length < 2) {
        errors['address.city'] = 'City must be at least 2 characters';
      }

      // State validation
      if (!customer.address.state?.trim()) {
        errors['address.state'] = 'State/Province is required';
      } else if (customer.address.state.trim().length < 2) {
        errors['address.state'] = 'State/Province must be at least 2 characters';
      }

      // Postal code validation with country-specific rules
      if (!customer.address.zipCode?.trim()) {
        errors['address.zipCode'] = 'Postal code is required';
      } else {
        const countryCode = this.getCountryCode(customer.address.country || '');
        if (!this.isValidPostalCode(customer.address.zipCode, countryCode)) {
          const postalLabel = this.getPostalCodeLabel(countryCode);
          errors['address.zipCode'] = `Please enter a valid ${postalLabel.toLowerCase()}`;
        }
      }
    }

    return errors;
  }

  // Get postal code label based on country
  static getPostalCodeLabel(countryCode?: string): string {
    const labels: { [key: string]: string } = {
      'IN': 'PIN Code',
      'US': 'ZIP Code',
      'CA': 'Postal Code',
      'GB': 'Postcode',
      'AU': 'Postcode',
      'DE': 'Postleitzahl',
      'FR': 'Code Postal',
      'JP': 'Postal Code',
      'BR': 'CEP',
      'NL': 'Postcode',
      'ES': 'Código Postal',
      'IT': 'CAP',
      'CN': 'Postal Code',
      'KR': 'Postal Code',
      'RU': 'Postal Code',
      'MX': 'Código Postal',
      'AR': 'Código Postal',
      'ZA': 'Postal Code',
      'CH': 'Postal Code',
    };

    return labels[countryCode || ''] || 'Postal Code';
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
}
