import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { asyncHandler } from '../middleware/errorHandler';
import { IApiResponse } from '../types';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { category, minPrice, maxPrice, inStock } = req.query;
  
  // Build filter object
  const filter: any = { isActive: true };
  
  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  
  if (inStock === 'true') {
    filter.inventory = { $gt: 0 };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .select('-__v');

  const response: IApiResponse = {
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      count: products.length
    }
  };

  res.status(200).json(response);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const product = await Product.findById(id).select('-__v');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product is no longer available'
    });
  }

  const response: IApiResponse = {
    success: true,
    message: 'Product retrieved successfully',
    data: product
  };

  res.status(200).json(response);
});

// @desc    Check product availability
// @route   POST /api/products/:id/check-availability
// @access  Public
export const checkAvailability = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { quantity, variants } = req.body;

  const product = await Product.findById(id);

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or unavailable'
    });
  }

  // Check main inventory
  if (product.inventory < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.inventory} items available in stock`,
      data: {
        available: product.inventory,
        requested: quantity
      }
    });
  }

  // Check variant availability if variants selected
  if (variants && variants.length > 0) {
    for (const selectedVariant of variants) {
      const variant = product.variants.find(
        v => v.type === selectedVariant.type && v.value === selectedVariant.value
      );
      
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Selected variant ${selectedVariant.type}: ${selectedVariant.value} is not available`
        });
      }
      
      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variant.stock} items available for ${selectedVariant.type}: ${selectedVariant.value}`,
          data: {
            variant: selectedVariant,
            available: variant.stock,
            requested: quantity
          }
        });
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Product is available',
    data: {
      available: true,
      quantity: quantity
    }
  });
});

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private (Internal use)
export const updateInventory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { quantity, operation, variants } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (operation === 'decrease') {
    if (product.inventory < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory'
      });
    }
    
    product.inventory -= quantity;
    
    // Update variant stock if applicable
    if (variants && variants.length > 0) {
      for (const selectedVariant of variants) {
        const variantIndex = product.variants.findIndex(
          v => v.type === selectedVariant.type && v.value === selectedVariant.value
        );
        
        if (variantIndex !== -1) {
          if (product.variants[variantIndex].stock < quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for variant ${selectedVariant.type}: ${selectedVariant.value}`
            });
          }
          product.variants[variantIndex].stock -= quantity;
        }
      }
    }
  } else if (operation === 'increase') {
    product.inventory += quantity;
    
    // Update variant stock if applicable
    if (variants && variants.length > 0) {
      for (const selectedVariant of variants) {
        const variantIndex = product.variants.findIndex(
          v => v.type === selectedVariant.type && v.value === selectedVariant.value
        );
        
        if (variantIndex !== -1) {
          product.variants[variantIndex].stock += quantity;
        }
      }
    }
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Inventory updated successfully',
    data: {
      inventory: product.inventory,
      variants: product.variants
    }
  });
});
