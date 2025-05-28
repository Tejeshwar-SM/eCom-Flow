import { Router, Request, Response, NextFunction } from 'express';
import { ProductModel } from '../models/Product';
import { createError } from '../middleware/errorHandler';
import Joi from 'joi';
import { validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const productParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

// GET /api/products - Get all products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    next(createError('Failed to fetch products', 500));
  }
});

// GET /api/products/:id - Get single product
router.get(
  '/:id',
  validateParams(productParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return next(createError('Product not found', 404));
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(createError('Failed to fetch product', 500));
    }
  }
);

export default router;
