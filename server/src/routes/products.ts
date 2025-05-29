import express from 'express';
import {
  getProducts,
  getProduct,
  checkAvailability,
  updateInventory
} from '../controllers/productController';
import { validateProduct, validateAvailability, validateInventoryUpdate } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with optional filtering
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateProduct, getProduct);

// @route   POST /api/products/:id/check-availability
// @desc    Check product availability for given quantity and variants
// @access  Public
router.post('/:id/check-availability', validateProduct, validateAvailability, checkAvailability);

// @route   PUT /api/products/:id/inventory
// @desc    Update product inventory (internal use)
// @access  Private
router.put('/:id/inventory', validateProduct, validateInventoryUpdate, updateInventory);

export default router;
