import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrder,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController';
import { 
  validateCreateOrder, 
  validateOrderNumber, 
  validateOrderId,
  validateOrderStatus 
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/orders
// @desc    List all orders
// @access  Public
router.get('/', getAllOrders);

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', validateCreateOrder, createOrder);

// @route   GET /api/orders/:orderNumber
// @desc    Get order by order number
// @access  Public
router.get('/:orderNumber', validateOrderNumber, getOrder);

// @route   GET /api/orders/id/:id
// @desc    Get order by MongoDB ID
// @access  Public
router.get('/id/:id', validateOrderId, getOrderById);

// @route   PUT /api/orders/:orderNumber/status
// @desc    Update order status
// @access  Private
router.put('/:orderNumber/status', validateOrderNumber, validateOrderStatus, updateOrderStatus);

export default router;