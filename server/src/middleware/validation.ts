import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to check validation results
export const checkValidationResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// MongoDB ObjectId validation
export const validateObjectId = (field: string) => {
  return param(field).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${field} format`);
    }
    return true;
  });
};

// ✅ Enhanced postal code validation for multiple countries
const validatePostalCode = (value: string, { req }: any) => {
  if (!value || value.trim() === '') {
    throw new Error('Postal code is required');
  }

  const cleanValue = value.trim();
  const country = req.body?.customer?.address?.country || '';

  // Country-specific postal code patterns
  const patterns: { [key: string]: { regex: RegExp; name: string } } = {
    'India': { 
      regex: /^[1-9]\d{5}$/, 
      name: 'PIN code (6 digits, cannot start with 0)' 
    },
    'United States': { 
      regex: /^\d{5}(-\d{4})?$/, 
      name: 'ZIP code (5 digits or 5+4 format)' 
    },
    'Canada': { 
      regex: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, 
      name: 'postal code (A1A 1A1 format)' 
    },
    'United Kingdom': { 
      regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, 
      name: 'postcode (UK format)' 
    },
    'Australia': { 
      regex: /^\d{4}$/, 
      name: 'postcode (4 digits)' 
    },
    'Germany': { 
      regex: /^\d{5}$/, 
      name: 'postcode (5 digits)' 
    },
    'France': { 
      regex: /^\d{5}$/, 
      name: 'postal code (5 digits)' 
    }
  };

  // If we have a country-specific pattern, use it
  if (country && patterns[country]) {
    const pattern = patterns[country];
    if (!pattern.regex.test(cleanValue)) {
      throw new Error(`Invalid ${pattern.name} format`);
    }
  } else {
    // Generic validation for unknown countries (alphanumeric, 3-10 chars)
    if (!/^[A-Z0-9\s-]{3,10}$/i.test(cleanValue)) {
      throw new Error('Invalid postal code format');
    }
  }

  return true;
};

// ✅ Enhanced phone validation for international numbers
const validateInternationalPhone = (value: string) => {
  if (!value || value.trim() === '') {
    throw new Error('Phone number is required');
  }

  // Basic international phone validation
  // Accepts +country_code followed by digits, spaces, hyphens, parentheses
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
  
  if (!phoneRegex.test(value.trim())) {
    throw new Error('Valid international phone number is required (include country code)');
  }

  return true;
};

// Custom validation for credit card number (Luhn algorithm)
const validateCreditCard = (value: string) => {
  const cleanValue = value.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanValue)) {
    throw new Error('Card number must be 13-19 digits');
  }
  
  // Luhn algorithm validation
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cleanValue.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanValue.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  if (sum % 10 !== 0) {
    throw new Error('Invalid card number');
  }
  
  return true;
};

// Custom validation for credit card expiry date
const validateExpiryDate = (value: string) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
    throw new Error('Expiry date must be in MM/YY format');
  }
  
  const [month, year] = value.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  
  if (expiryDate < now) {
    throw new Error('Card has expired');
  }
  
  return true;
};

// ✅ Updated order validation with international support
export const validateCreateOrder = [
  // Customer validation
  body('customer.fullName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  // ✅ Updated phone validation for international numbers
  body('customer.phone')
    .custom(validateInternationalPhone),
  
  body('customer.address.street')
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('customer.address.city')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('customer.address.state')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State/Province must be between 2 and 100 characters'),
  
  // ✅ Updated postal code validation for multiple countries
  body('customer.address.zipCode')
    .custom(validatePostalCode),
  
  body('customer.address.country')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country is required'),

  // Product validation
  body('product.productId')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid product ID format');
      }
      return true;
    }),
  
  body('product.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  
  body('product.selectedVariants')
    .optional()
    .isArray()
    .withMessage('Selected variants must be an array'),

  // Payment validation
  body('paymentInfo.cardNumber')
    .custom(validateCreditCard),
  
  body('paymentInfo.expiryDate')
    .custom(validateExpiryDate),
  
  body('paymentInfo.cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  
  body('paymentInfo.cardholderName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cardholder name must be between 2 and 100 characters'),

  // Transaction result validation
  body('transactionResult')
    .isIn(['approved', 'declined', 'error'])
    .withMessage('Transaction result must be approved, declined, or error'),

  checkValidationResult
];

// Payment validations
export const validatePaymentProcess = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('cardNumber')
    .custom(validateCreditCard),
  body('expiryDate')
    .custom(validateExpiryDate),
  body('cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  body('cardholderName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cardholder name must be between 2 and 100 characters'),
  checkValidationResult
];

export const validatePaymentDetails = [
  body('cardNumber')
    .custom(validateCreditCard),
  body('expiryDate')
    .custom(validateExpiryDate),
  body('cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  checkValidationResult
];

// Other validations
export const validateOrderNumber = [
  param('orderNumber')
    .isString()
    .trim()
    .matches(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/)
    .withMessage('Invalid order number format'),
  checkValidationResult
];

export const validateOrderId = [
  validateObjectId('id'),
  checkValidationResult
];

export const validateOrderStatus = [
  body('status')
    .isIn(['pending', 'approved', 'declined', 'failed', 'refunded'])
    .withMessage('Invalid order status'),
  checkValidationResult
];

export const validateProduct = [
  validateObjectId('id'),
  checkValidationResult
];

export const validateAvailability = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  body('variants.*.type')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Variant type is required'),
  body('variants.*.value')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Variant value is required'),
  checkValidationResult
];

export const validateInventoryUpdate = [
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('operation')
    .isIn(['increase', 'decrease'])
    .withMessage('Operation must be either increase or decrease'),
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  checkValidationResult
];
