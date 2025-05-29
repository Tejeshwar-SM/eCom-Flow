import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, IVariant } from '../types';

interface IProductDocument extends IProduct, Document {}

const VariantSchema = new Schema<IVariant>({
  type: {
    type: String,
    enum: ['color', 'size'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, { _id: false });

const ProductSchema = new Schema<IProductDocument>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    trim: true
  },
  variants: {
    type: [VariantSchema],
    default: []
  },
  inventory: {
    type: Number,
    required: true,
    min: [0, 'Inventory cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ price: 1 });

// Virtual for total stock across all variants
ProductSchema.virtual('totalVariantStock').get(function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function(quantity: number = 1): boolean {
  return this.inventory >= quantity;
};

// Method to reduce inventory
ProductSchema.methods.reduceInventory = function(quantity: number): boolean {
  if (this.inventory >= quantity) {
    this.inventory -= quantity;
    return true;
  }
  return false;
};

export default mongoose.model<IProductDocument>('Product', ProductSchema);
