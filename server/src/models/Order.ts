import mongoose, { Schema, Document } from 'mongoose';
import { Order as IOrder, TransactionStatus } from '../types/order';
import { Customer } from '../types/customer';

interface OrderDocument extends Omit<IOrder, '_id'>, Document {}

const customerSchema = new Schema<Customer>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true }
});

const orderSchema = new Schema<OrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: customerSchema,
    required: true
  },
  product: {
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    selectedVariants: {
      type: Map,
      of: String,
      default: {}
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  payment: {
    cardNumber: {
      type: String,
      required: true // Only last 4 digits
    },
    transactionStatus: {
      type: String,
      enum: ['approved', 'declined', 'error'],
      required: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    }
  },
  totals: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema);
