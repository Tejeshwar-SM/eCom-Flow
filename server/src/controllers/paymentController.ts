import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { paymentService } from '../services/paymentService';
import { IApiResponse, TransactionResult } from '../types';

// @desc    Process payment
// @route   POST /api/payment/process
// @access  Public
export const processPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    amount,
    cardNumber,
    expiryDate,
    cvv,
    cardholderName
  } = req.body;

  // Validate amount
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment amount'
    });
  }

  // Simulate payment processing
  const paymentResult = await paymentService.processPayment({
    amount,
    cardNumber,
    expiryDate,
    cvv,
    cardholderName
  });

  const response: IApiResponse = {
    success: paymentResult.result === 'approved',
    message: paymentResult.message,
    data: {
      result: paymentResult.result,
      transactionId: paymentResult.transactionId,
      timestamp: new Date().toISOString(),
      ...(paymentResult.result !== 'approved' && { 
        errorCode: paymentResult.errorCode,
        retryAllowed: paymentResult.retryAllowed 
      })
    }
  };

  // Return appropriate status code
  const statusCode = paymentResult.result === 'approved' ? 200 : 
                    paymentResult.result === 'declined' ? 402 : 500;

  res.status(statusCode).json(response);
});

// @desc    Validate payment details
// @route   POST /api/payment/validate
// @access  Public
export const validatePayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { cardNumber, expiryDate, cvv } = req.body;

  const validation = paymentService.validatePaymentDetails({
    cardNumber,
    expiryDate,
    cvv
  });

  const response: IApiResponse = {
    success: validation.isValid,
    message: validation.isValid ? 'Payment details are valid' : 'Invalid payment details',
    data: {
      isValid: validation.isValid,
      errors: validation.errors,
      cardType: validation.cardType
    }
  };

  res.status(validation.isValid ? 200 : 400).json(response);
});

// @desc    Get supported card types
// @route   GET /api/payment/card-types
// @access  Public
export const getCardTypes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const cardTypes = paymentService.getSupportedCardTypes();

  const response: IApiResponse = {
    success: true,
    message: 'Supported card types retrieved successfully',
    data: cardTypes
  };

  res.status(200).json(response);
});
