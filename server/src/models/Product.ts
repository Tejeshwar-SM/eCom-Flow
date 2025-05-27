import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct, Variant } from '../types/product';

interface ProductDocument extends Omit<IProduct, '_id'>, Document {}

const variantSchema = new Schema<Variant>({
  type: {
    type: String,
    enum: ['color', 'size', 'style'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }]
});

const productSchema = new Schema<ProductDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  variants: [variantSchema],
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

export const ProductModel = mongoose.model<ProductDocument>('Product', productSchema);
