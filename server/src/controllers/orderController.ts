import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Product from '../models/Product';
import { asyncHandler } from '../middleware/errorHandler';
import { IApiResponse, IOrder, ICustomer, TransactionResult } from '../types';
import { emailService } from '../services/emailService';
import { inventoryService } from '../services/inventoryService';

// Function to generate a unique order number
const generateOrderNumber = async (): Promise<string> => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const orderNumber = `${prefix}-${timestamp}-${random}`;
  
  // Check if this order number already exists to ensure uniqueness
  const existingOrder = await Order.findOne({ orderNumber });
  if (existingOrder) {
    // Recursively try again if the order number already exists
    return generateOrderNumber();
  }
  
  return orderNumber;
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find()
    .populate<{ customer: ICustomer }>('customer')
    .select('-__v -paymentInfo.cvv')
    .sort({ createdAt: -1 });

  const response: IApiResponse<IOrder[]> = {
    success: true,
    message: 'Orders retrieved successfully',
    data: orders
  };

  res.status(200).json(response);
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    customer: customerData,
    product: productData,
    paymentInfo,
    transactionResult
  }: {
    customer: ICustomer;
    product: { productId: string; quantity: number; selectedVariants?: any[] };
    paymentInfo: { cardNumber: string; expiryDate: string; cardholderName: string; cvv: string };
    transactionResult: TransactionResult;
  } = req.body;

  // Create or find customer
  let customer = await Customer.findOne({ email: customerData.email });
  
  if (!customer) {
    customer = new Customer(customerData);
    await customer.save();
  } else {
    // Update customer info if changed
    customer.fullName = customerData.fullName || customer.fullName;
    customer.phone = customerData.phone || customer.phone;
    if (customerData.address) {
        customer.address.street = customerData.address.street || customer.address.street;
        customer.address.city = customerData.address.city || customer.address.city;
        customer.address.state = customerData.address.state || customer.address.state;
        customer.address.zipCode = customerData.address.zipCode || customer.address.zipCode;
        customer.address.country = customerData.address.country || customer.address.country;
    }
    await customer.save();
  }

  // Verify product exists and is available
  const product = await Product.findById(productData.productId);
  
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or unavailable'
    });
  }

  // Check inventory availability
  if (product.inventory < productData.quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient inventory',
      data: {
        available: product.inventory,
        requested: productData.quantity
      }
    });
  }

  // Generate unique order number (using our custom function instead of static method)
  const orderNumber = await generateOrderNumber();

  // Prepare order data
  const orderData: Partial<IOrder> = {
    orderNumber,
    // Properly cast customer._id to mongoose.Types.ObjectId before calling toString()
    customer: (customer._id as mongoose.Types.ObjectId).toString(),
    product: {
      productId: (product._id as mongoose.Types.ObjectId).toString(),
      name: product.name,
      price: product.price,
      quantity: productData.quantity,
      selectedVariants: productData.selectedVariants || [],
      image: product.image
    },
    paymentInfo: {
      cardNumber: paymentInfo.cardNumber.slice(-4),
      expiryDate: paymentInfo.expiryDate,
      cardholderName: paymentInfo.cardholderName
    },
    status: transactionResult === 'approved' ? 'approved' : 
            transactionResult === 'declined' ? 'declined' : 'failed',
    subtotal: product.price * productData.quantity,
    tax: 0, // You may want to calculate this based on your business rules
    total: product.price * productData.quantity, // Should include tax if applicable
  };

  // Create order
  const order = new Order(orderData);
  await order.save();

  // If transaction approved, update inventory
  if (transactionResult === 'approved') {
    await inventoryService.reduceInventory(
      (product._id as mongoose.Types.ObjectId).toString(),
      productData.quantity,
      productData.selectedVariants
    );
  }

  // Populate customer data for response and email
  const populatedOrder = await Order.findById(order._id).populate<{ customer: ICustomer }>('customer');

  if (!populatedOrder) {
    console.error('Order not found after save and populate');
    return res.status(500).json({ success: false, message: 'Error creating order' });
  }

  // Send confirmation email
  try {
    if (transactionResult === 'approved') {
      await emailService.sendOrderConfirmation(populatedOrder as IOrder, populatedOrder.customer as ICustomer);
    } else {
      await emailService.sendOrderFailure(populatedOrder as IOrder, populatedOrder.customer as ICustomer, transactionResult);
    }
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError);
    // Don't fail the order creation if email fails
  }

  const response: IApiResponse = {
    success: true,
    message: 'Order created successfully',
    data: {
      orderNumber: populatedOrder.orderNumber,
      status: populatedOrder.status,
      total: populatedOrder.total,
      customer: populatedOrder.customer,
      product: populatedOrder.product
    }
  };

  res.status(201).json(response);
});

// @desc    Get order by order number
// @route   GET /api/orders/:orderNumber
// @access  Public
export const getOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .populate<{ customer: ICustomer }>('customer')
    .select('-__v -paymentInfo.cvv');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const response: IApiResponse<IOrder> = {
    success: true,
    message: 'Order retrieved successfully',
    data: order
  };

  res.status(200).json(response);
});

// @desc    Get order by ID
// @route   GET /api/orders/id/:id
// @access  Public
export const getOrderById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Order ID' });
  }

  const order = await Order.findById(id)
    .populate<{ customer: ICustomer }>('customer')
    .select('-__v -paymentInfo.cvv');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const response: IApiResponse<IOrder> = {
    success: true,
    message: 'Order retrieved successfully',
    data: order
  };

  res.status(200).json(response);
});

// @desc    Update order status
// @route   PUT /api/orders/:orderNumber/status
// @access  Private (ensure you have auth middleware for this)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { orderNumber } = req.params;
  const { status } = req.body as { status: IOrder['status'] };

  const order = await Order.findOne({ orderNumber }).populate<{ customer: ICustomer }>('customer');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const oldStatus = order.status;
  order.status = status;
  await order.save();

  // Handle inventory changes based on status change
  if (oldStatus === 'approved' && (status === 'declined' || status === 'failed' || status === 'refunded')) {
    // Return inventory
    await inventoryService.increaseInventory(
      order.product.productId,
      order.product.quantity,
      order.product.selectedVariants
    );
  } else if ((oldStatus === 'declined' || oldStatus === 'failed' || oldStatus === 'pending') && status === 'approved') {
    // Reduce inventory
    await inventoryService.reduceInventory(
      order.product.productId,
      order.product.quantity,
      order.product.selectedVariants
    );
  }

  const response: IApiResponse = {
    success: true,
    message: 'Order status updated successfully',
    data: {
      orderNumber: order.orderNumber,
      oldStatus,
      newStatus: status
    }
  };

  res.status(200).json(response);
});