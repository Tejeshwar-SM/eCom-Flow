import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { validateRequest } from '../middleware/validation';
import { checkoutValidationSchema, validateExpiryDate } from '../utils/validators';
import { createError } from '../middleware/errorHandler';
import { TypedRequest, CheckoutRequestBody } from '../types/express';

const router = Router();
const orderService = new OrderService();

// Custom validation for expiry date
const validateCheckoutData = (req: Request, res: Response, next: NextFunction) => {
  const { payment } = req.body;
  
  if (payment && payment.expiryDate) {
    const isValidExpiry = validateExpiryDate(payment.expiryDate);
    if (!isValidExpiry) {
      return next(createError('Card expiry date must be in the future', 400));
    }
  }
  
  next();
};

// POST /api/checkout - Process checkout
router.post(
  '/',
  validateRequest(checkoutValidationSchema),
  validateCheckoutData,
  async (req: TypedRequest<CheckoutRequestBody>, res: Response, next: NextFunction) => {
    try {
      const checkoutData = req.body;
      
      const result = await orderService.processOrder(checkoutData);
      
      res.status(result.success ? 200 : 400).json({
        success: result.success,
        data: {
          orderNumber: result.orderNumber,
          transactionStatus: result.transactionStatus,
          message: result.message
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
