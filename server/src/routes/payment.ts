import express from 'express';
import {
  processPayment,
  validatePayment,
  getCardTypes
} from '../controllers/paymentController';
import { validatePaymentProcess, validatePaymentDetails } from '../middleware/validation';

const router = express.Router();

// @route   POST /api/payment/process
// @desc    Process payment transaction
// @access  Public
router.post('/process', validatePaymentProcess, processPayment);

// @route   POST /api/payment/validate
// @desc    Validate payment details without processing
// @access  Public
router.post('/validate', validatePaymentDetails, validatePayment);

// @route   GET /api/payment/card-types
// @desc    Get supported card types
// @access  Public
router.get('/card-types', getCardTypes);

export default router;
