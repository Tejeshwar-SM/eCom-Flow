import { TransactionResult } from '../types';

interface PaymentDetails {
  amount: number;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentResult {
  result: TransactionResult;
  message: string;
  transactionId?: string;
  errorCode?: string;
  retryAllowed?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  cardType?: string;
}

class PaymentService {
  private supportedCardTypes = [
    { name: 'Visa', pattern: /^4\d{12}(?:\d{3})?$/, code: 'visa' },
    { name: 'MasterCard', pattern: /^5[1-5]\d{14}$/, code: 'mastercard' },
    { name: 'American Express', pattern: /^3[47]\d{13}$/, code: 'amex' },
    { name: 'Discover', pattern: /^6(?:011|5\d{2})\d{12}$/, code: 'discover' }
  ];

  async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    // Simulate processing delay
    await this.delay(1000 + Math.random() * 2000);

    // Validate payment details first
    const validation = this.validatePaymentDetails(paymentDetails);
    if (!validation.isValid) {
      return {
        result: 'error',
        message: 'Invalid payment details',
        errorCode: 'INVALID_DETAILS',
        retryAllowed: true
      };
    }

    // Simulate different transaction outcomes based on card number patterns
    const result = this.simulateTransaction(paymentDetails.cardNumber);
    
    return {
      result: result.outcome,
      message: result.message,
      transactionId: result.outcome === 'approved' ? this.generateTransactionId() : undefined,
      errorCode: result.errorCode,
      retryAllowed: result.retryAllowed
    };
  }

  validatePaymentDetails(details: Partial<PaymentDetails>): ValidationResult {
    const errors: string[] = [];
    let cardType: string | undefined;

    // Validate card number
    if (!details.cardNumber) {
      errors.push('Card number is required');
    } else {
      const cleanCardNumber = details.cardNumber.replace(/\s/g, '');
      
      if (!/^\d{13,19}$/.test(cleanCardNumber)) {
        errors.push('Invalid card number format');
      } else {
        // Check card type
        const detectedCardType = this.detectCardType(cleanCardNumber);
        if (!detectedCardType) {
          errors.push('Unsupported card type');
        } else {
          cardType = detectedCardType;
        }

        // Luhn algorithm validation
        if (!this.validateLuhn(cleanCardNumber)) {
          errors.push('Invalid card number');
        }
      }
    }

    // Validate expiry date
    if (!details.expiryDate) {
      errors.push('Expiry date is required');
    } else {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.expiryDate)) {
        errors.push('Invalid expiry date format (MM/YY)');
      } else {
        const [month, year] = details.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        
        if (expiryDate < now) {
          errors.push('Card has expired');
        }
      }
    }

    // Validate CVV
    if (!details.cvv) {
      errors.push('CVV is required');
    } else {
      const cvvLength = cardType === 'amex' ? 4 : 3;
      if (!/^\d{3,4}$/.test(details.cvv) || details.cvv.length !== cvvLength) {
        errors.push(`CVV must be ${cvvLength} digits`);
      }
    }

    // Validate cardholder name
    if (!details.cardholderName) {
      errors.push('Cardholder name is required');
    } else if (details.cardholderName.trim().length < 2) {
      errors.push('Cardholder name is too short');
    }

    return {
      isValid: errors.length === 0,
      errors,
      cardType
    };
  }

  getSupportedCardTypes() {
    return this.supportedCardTypes.map(type => ({
      name: type.name,
      code: type.code
    }));
  }

  private simulateTransaction(cardNumber: string): {
    outcome: TransactionResult;
    message: string;
    errorCode?: string;
    retryAllowed?: boolean;
  } {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const lastDigit = parseInt(cleanCardNumber.slice(-1), 10);
    const lastTwoDigits = parseInt(cleanCardNumber.slice(-2), 10);

    // Simulation rules based on card number patterns
    if (lastDigit === 1 || lastDigit === 3 || lastDigit === 5 || lastDigit === 7 || lastDigit === 9) {
      // ~50% approval rate for odd ending digits
      return {
        outcome: 'approved',
        message: 'Transaction approved successfully'
      };
    } else if (lastTwoDigits === 10 || lastTwoDigits === 20 || lastTwoDigits === 30) {
      // Simulate declined transactions
      return {
        outcome: 'declined',
        message: 'Transaction declined by issuing bank',
        errorCode: 'DECLINED_BY_BANK',
        retryAllowed: false
      };
    } else if (lastTwoDigits === 0 || lastTwoDigits === 99) {
      // Simulate gateway errors
      return {
        outcome: 'error',
        message: 'Payment gateway error. Please try again.',
        errorCode: 'GATEWAY_ERROR',
        retryAllowed: true
      };
    } else if (lastDigit === 4) {
      // Simulate insufficient funds
      return {
        outcome: 'declined',
        message: 'Insufficient funds',
        errorCode: 'INSUFFICIENT_FUNDS',
        retryAllowed: false
      };
    } else {
      // Default to approval for other cases
      return {
        outcome: 'approved',
        message: 'Transaction approved successfully'
      };
    }
  }

  private detectCardType(cardNumber: string): string | undefined {
    for (const cardType of this.supportedCardTypes) {
      if (cardType.pattern.test(cardNumber)) {
        return cardType.code;
      }
    }
    return undefined;
  }

  private validateLuhn(cardNumber: string): boolean {
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

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const paymentService = new PaymentService();
