import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, IOrderProduct, IPaymentInfo, ISelectedVariant } from '../types';

// Subdocument schema for selected variants
const SelectedVariantSchema = new Schema<ISelectedVariant>({
  type: {
    type: String,
    required: [true, 'Variant type is required'],
    trim: true
  },
  value: {
    type: String,
    required: [true, 'Variant value is required'],
    trim: true
  }
}, { _id: false });

// Subdocument schema for order products
const OrderProductSchema = new Schema<IOrderProduct>({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10']
  },
  selectedVariants: {
    type: [SelectedVariantSchema],
    default: []
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    trim: true
  }
}, { _id: false });

// Subdocument schema for payment information
const PaymentInfoSchema = new Schema<IPaymentInfo>({
  cardNumber: {
    type: String,
    required: [true, 'Card number is required'],
    trim: true,
    match: [/^\d{4}$/, 'Only last 4 digits should be stored']
  },
  expiryDate: {
    type: String,
    required: [true, 'Expiry date is required'],
    trim: true,
    match: [/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date format (MM/YY)']
  },
  cardholderName: {
    type: String,
    required: [true, 'Cardholder name is required'],
    trim: true,
    maxlength: [100, 'Cardholder name cannot exceed 100 characters']
  }
}, { _id: false });

const OrderSchema = new Schema<IOrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer information is required']
  },
  product: {
    type: OrderProductSchema,
    required: [true, 'Product information is required']
  },
  paymentInfo: {
    type: PaymentInfoSchema,
    required: [true, 'Payment information is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'failed', 'refunded'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
OrderSchema.index({ status: 1 });
OrderSchema.index({ customer: 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total if not provided
OrderSchema.pre('save', function(this: IOrderDocument, next) {
  if (!this.total) {
    this.total = this.subtotal + this.tax;
  }
  next();
});

// Instance methods
OrderSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  return this.save();
};

OrderSchema.methods.calculateTotal = function() {
  return this.subtotal + this.tax;
};

// Virtual for order age
OrderSchema.virtual('orderAge').get(function(this: IOrderDocument) {
  if (!this.createdAt) return null;
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted order number
OrderSchema.virtual('formattedOrderNumber').get(function(this: IOrderDocument) {
  return this.orderNumber;
});

interface IOrderDocument extends IOrder, Document {
  updateStatus(newStatus: string): Promise<IOrderDocument>;
  calculateTotal(): number;
  orderAge?: number;
  formattedOrderNumber?: string;
}

export default mongoose.model<IOrderDocument>('Order', OrderSchema);