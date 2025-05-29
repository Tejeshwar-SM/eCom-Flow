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
      await connectDB();
      
      const existingProducts = await Product.countDocuments();
      
      if (existingProducts === 0) {
        Helpers.logInfo('🌱 Seeding database with sample products...');
        
        await Product.insertMany(sampleProducts);
        
        const productCount = await Product.countDocuments();
        Helpers.logSuccess(`✅ Successfully seeded ${productCount} products`);
      } else {
        Helpers.logInfo(`ℹ️  Database already contains ${existingProducts} products. Skipping seed.`);
      }
    } catch (error) {
      Helpers.logError('❌ Error seeding database:', error);
      throw error;
    }
  }

  static async clearDatabase(): Promise<void> {
    try {
      await connectDB();
      
      await Product.deleteMany({});
      Helpers.logSuccess('🗑️  Database cleared successfully');
    } catch (error) {
      Helpers.logError('❌ Error clearing database:', error);
      throw error;
    }
  }

  static async resetDatabase(): Promise<void> {
    try {
      await this.clearDatabase();
      await this.seedDatabase();
      Helpers.logSuccess('🔄 Database reset completed');
    } catch (error) {
      Helpers.logError('❌ Error resetting database:', error);
      throw error;
    }
  }
}

// CLI script runner
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      SeedData.seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'clear':
      SeedData.clearDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reset':
      SeedData.resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Usage: npm run seed [seed|clear|reset]');
      process.exit(1);
  }
}
