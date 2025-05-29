import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { createError } from './errorHandler';

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

// Product validations
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

// Order validations
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
  body('customer.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Valid phone number is required'),
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
    .withMessage('State must be between 2 and 100 characters'),
  body('customer.address.zipCode')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Valid zip code is required (e.g., 12345 or 12345-6789)'),
  body('customer.address.country')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),

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
    .matches(/^\d{13,19}$/)
    .withMessage('Card number must be 13-19 digits'),
  body('paymentInfo.expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiry date must be in MM/YY format')
    .custom((value) => {
      const [month, year] = value.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiryDate < now) {
        throw new Error('Card has expired');
      }
      return true;
    }),
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

// Payment validations
export const validatePaymentProcess = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('cardNumber')
    .matches(/^\d{13,19}$/)
    .withMessage('Card number must be 13-19 digits'),
  body('expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiry date must be in MM/YY format')
    .custom((value) => {
      const [month, year] = value.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiryDate < now) {
        throw new Error('Card has expired');
      }
      return true;
    }),
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
    .matches(/^\d{13,19}$/)
    .withMessage('Card number must be 13-19 digits'),
  body('expiryDate')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiry date must be in MM/YY format'),
  body('cvv')
    .matches(/^\d{3,4}$/)
    .withMessage('CVV must be 3 or 4 digits'),
  checkValidationResult
];
