import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database';
import Product from '../models/Product';
import { IProduct } from '../types';
import { Helpers } from './helpers';

const sampleProducts: Partial<IProduct>[] = [
  {
    name: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort padding. Perfect for music enthusiasts, professionals, and travelers who demand the best in audio quality.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Electronics',
    inventory: 50,
    variants: [
      { type: 'color', name: 'Midnight Black', value: 'black', stock: 20 },
      { type: 'color', name: 'Pearl White', value: 'white', stock: 15 },
      { type: 'color', name: 'Space Gray', value: 'gray', stock: 15 }
    ],
    isActive: true
  },
  {
    name: 'Smart Fitness Watch Pro',
    description: 'Advanced fitness tracker with comprehensive health monitoring including heart rate, blood oxygen, sleep tracking, and GPS. Features 50+ workout modes, smart notifications, and 7-day battery life. Your perfect fitness companion.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    category: 'Electronics',
    inventory: 35,
    variants: [
      { type: 'color', name: 'Midnight Black', value: 'black', stock: 12 },
      { type: 'color', name: 'Rose Gold', value: 'rose-gold', stock: 10 },
      { type: 'color', name: 'Space Gray', value: 'space-gray', stock: 8 },
      { type: 'color', name: 'Ocean Blue', value: 'blue', stock: 5 },
      { type: 'size', name: '42mm', value: '42mm', stock: 18 },
      { type: 'size', name: '46mm', value: '46mm', stock: 17 }
    ],
    isActive: true
  },
  {
    name: 'Eco-Friendly Insulated Water Bottle',
    description: 'Sustainable triple-wall vacuum insulated water bottle made from premium stainless steel. Keeps beverages hot for 12 hours and cold for 24 hours. BPA-free, leak-proof, and designed for active lifestyles. Make a positive environmental impact.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    category: 'Lifestyle',
    inventory: 120,
    variants: [
      { type: 'color', name: 'Ocean Blue', value: 'ocean-blue', stock: 30 },
      { type: 'color', name: 'Forest Green', value: 'forest-green', stock: 30 },
      { type: 'color', name: 'Sunset Orange', value: 'sunset-orange', stock: 25 },
      { type: 'color', name: 'Arctic White', value: 'arctic-white', stock: 20 },
      { type: 'color', name: 'Charcoal Black', value: 'charcoal-black', stock: 15 },
      { type: 'size', name: '500ml', value: '500ml', stock: 60 },
      { type: 'size', name: '750ml', value: '750ml', stock: 60 }
    ],
    isActive: true
  },
  {
    name: 'Professional Laptop Backpack',
    description: 'Premium laptop backpack designed for professionals and students. Features dedicated laptop compartment (fits up to 17"), multiple organizational pockets, USB charging port, water-resistant material, and ergonomic design for all-day comfort.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    category: 'Accessories',
    inventory: 75,
    variants: [
      { type: 'color', name: 'Business Black', value: 'black', stock: 25 },
      { type: 'color', name: 'Navy Blue', value: 'navy', stock: 20 },
      { type: 'color', name: 'Charcoal Gray', value: 'gray', stock: 15 },
      { type: 'color', name: 'Coffee Brown', value: 'brown', stock: 15 }
    ],
    isActive: true
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Features intelligent charging with over-current protection, temperature control, and foreign object detection. Sleek design perfect for home or office use.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop',
    category: 'Electronics',
    inventory: 90,
    variants: [
      { type: 'color', name: 'Pure White', value: 'white', stock: 30 },
      { type: 'color', name: 'Matte Black', value: 'black', stock: 30 },
      { type: 'color', name: 'Space Gray', value: 'gray', stock: 30 }
    ],
    isActive: true
  }
];

export class SeedData {
  static async seedDatabase(): Promise<void> {
    try {
      console.log('🔗 Connecting to database...');
      await connectDB();
      
      // Debug: Show connection info
      const mongoose = require('mongoose');
      console.log('📍 Database:', mongoose.connection.db.databaseName);
      console.log('🌐 Host:', mongoose.connection.host);
      
      // FORCE CLEAR AND RESEED - This fixes the isActive field issue
      console.log('🗑️ Clearing existing products...');
      const deleteResult = await Product.deleteMany({});
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing products`);
      
      console.log('🌱 Seeding database with fresh products...');
      const result = await Product.insertMany(sampleProducts);
      console.log(`✅ Successfully seeded ${result.length} products`);
      
      // Verify with different queries
      const totalCount = await Product.countDocuments();
      const activeCount = await Product.countDocuments({ isActive: true });
      const inactiveCount = await Product.countDocuments({ isActive: false });
      const noIsActiveField = await Product.countDocuments({ isActive: { $exists: false } });
      
      console.log(`📊 Database Summary:`);
      console.log(`   Total products: ${totalCount}`);
      console.log(`   Active products: ${activeCount}`);
      console.log(`   Inactive products: ${inactiveCount}`);
      console.log(`   Products without isActive field: ${noIsActiveField}`);
      
      // Show sample product
      const sampleProduct = await Product.findOne({});
      console.log(`📝 Sample product: ${sampleProduct?.name} (isActive: ${sampleProduct?.isActive})`);
      
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    } finally {
      process.exit(0);
    }
  }

  static async clearDatabase(): Promise<void> {
    try {
      await connectDB();
      const result = await Product.deleteMany({});
      console.log(`🗑️ Database cleared successfully. Deleted ${result.deletedCount} products.`);
    } catch (error) {
      console.error('❌ Error clearing database:', error);
      throw error;
    } finally {
      process.exit(0);
    }
  }

  static async resetDatabase(): Promise<void> {
    try {
      await this.clearDatabase();
      await this.seedDatabase();
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }

  static async fixIsActiveField(): Promise<void> {
    try {
      await connectDB();
      
      // Add isActive: true to products that don't have this field
      const result = await Product.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
      );
      
      console.log(`✅ Fixed ${result.modifiedCount} products with missing isActive field`);
      
      const activeCount = await Product.countDocuments({ isActive: true });
      console.log(`📊 Total active products: ${activeCount}`);
      
    } catch (error) {
      console.error('❌ Error fixing isActive field:', error);
      throw error;
    } finally {
      process.exit(0);
    }
  }
}

// CLI script runner
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      SeedData.seedDatabase();
      break;
    case 'clear':
      SeedData.clearDatabase();
      break;
    case 'reset':
      SeedData.resetDatabase();
      break;
    case 'fix':
      SeedData.fixIsActiveField();
      break;
    default:
      console.log('Usage: npm run seed [seed|clear|reset|fix]');
      console.log('  seed  - Force clear and reseed all products');
      console.log('  clear - Clear all products');
      console.log('  reset - Clear and reseed');
      console.log('  fix   - Add isActive field to existing products');
      process.exit(1);
  }
}
