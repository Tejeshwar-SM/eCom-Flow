import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import { ICustomer, IPaymentInfo } from '../types';

export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  // ✅ Updated for international phone support
  static isValidPhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return false;
    
    try {
      // Use libphonenumber-js for proper international validation
      return isValidPhoneNumber(phone);
    } catch (error) {
      // Fallback to regex for basic validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(phone);
    }
  }

  // ✅ Updated for international postal codes
  static isValidPostalCode(postalCode: string, countryCode?: string): boolean {
    if (!postalCode || postalCode.trim() === '') return false;
    
    const cleanCode = postalCode.trim().toUpperCase();
    
    // Country-specific postal code patterns
    const patterns: { [key: string]: RegExp } = {
      'IN': /^\d{6}$/, // India PIN codes
      'US': /^\d{5}(-\d{4})?$/, // US ZIP codes
      'CA': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/, // Canada postal codes
      'GB': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/, // UK postcodes
      'AU': /^\d{4}$/, // Australia postcodes
      'DE': /^\d{5}$/, // Germany postcodes
      'FR': /^\d{5}$/, // France postal codes
    };
    
    if (countryCode && patterns[countryCode]) {
      return patterns[countryCode].test(cleanCode);
    }
    
    // Generic validation for unknown countries
    return /^[A-Z0-9\s-]{3,10}$/.test(cleanCode);
  }

  // ✅ Keep existing but use new postal code validation
  static isValidZipCode(zipCode: string): boolean {
    // This is for backward compatibility - now supports multiple formats
    return this.isValidPostalCode(zipCode, 'US') || this.isValidPostalCode(zipCode, 'IN');
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

  // ✅ Get country code from country name
  static getCountryCode(countryName: string): string | undefined {
    const countryMapping: { [key: string]: string } = {
      'India': 'IN',
      'United States': 'US',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      // Add more as needed
    };
    
    return countryMapping[countryName];
  }

  // ✅ Updated customer validation with international support
  static validateCustomerData(customer: Partial<ICustomer>): string[] {
    const errors: string[] = [];

    if (!customer.fullName || customer.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters');
    }

    if (!customer.email || !this.isValidEmail(customer.email)) {
      errors.push('Valid email address is required');
    }

    // ✅ Updated phone validation
    if (!customer.phone || !this.isValidPhone(customer.phone)) {
      errors.push('Valid phone number with country code is required');
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

      if (!customer.address.country) {
        errors.push('Country is required');
      }

      // ✅ Updated postal code validation
      if (!customer.address.zipCode) {
        errors.push('Postal code is required');
      } else {
        const countryCode = this.getCountryCode(customer.address.country || '');
        if (!this.isValidPostalCode(customer.address.zipCode, countryCode)) {
          const label = countryCode === 'IN' ? 'PIN code' : 
                       countryCode === 'US' ? 'ZIP code' : 'postal code';
          errors.push(`Valid ${label} is required`);
        }
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
