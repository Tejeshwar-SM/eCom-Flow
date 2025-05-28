import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { createError } from '../middleware/errorHandler';
import { validateParams } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const orderService = new OrderService();

// Validation schemas
const orderNumberSchema = Joi.object({
  orderNumber: Joi.string().pattern(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/).required()
});

// GET /api/orders/:orderNumber - Get order by order number
router.get(
  '/:orderNumber',
  validateParams(orderNumberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      
      if (!order) {
        return next(createError('Order not found', 404));
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/orders/:orderNumber/resend-email - Resend order confirmation email
router.post(
  '/:orderNumber/resend-email',
  validateParams(orderNumberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderNumber } = req.params;
      const emailSent = await orderService.resendOrderEmail(orderNumber);
      
      res.json({
        success: true,
        message: emailSent ? 'Email sent successfully' : 'Failed to send email',
        data: { emailSent }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
