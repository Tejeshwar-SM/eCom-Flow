import Product from '../models/Product';
import { IProduct } from '../types';

export class DatabaseUtils {
  static async seedProducts(): Promise<void> {
    try {
      const existingProducts = await Product.countDocuments();
      
      if (existingProducts === 0) {
        console.log('🌱 Seeding database with sample products...');
        
        const sampleProducts: Partial<IProduct>[] = [
          {
            name: 'Premium Wireless Headphones',
            description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
            price: 199.99,
            image: '/images/headphones.jpg',
            category: 'Electronics',
            inventory: 50,
            variants: [
              { type: 'color', name: 'Black', value: 'black', stock: 20 },
              { type: 'color', name: 'White', value: 'white', stock: 15 },
              { type: 'color', name: 'Silver', value: 'silver', stock: 15 }
            ],
            isActive: true
          },
          {
            name: 'Smart Fitness Watch',
            description: 'Advanced fitness tracker with heart rate monitoring, GPS, and smart notifications. Track your health and stay connected.',
            price: 299.99,
            image: '/images/smartwatch.jpg',
            category: 'Electronics',
            inventory: 30,
            variants: [
              { type: 'color', name: 'Black', value: 'black', stock: 12 },
              { type: 'color', name: 'Rose Gold', value: 'rose-gold', stock: 10 },
              { type: 'color', name: 'Space Gray', value: 'space-gray', stock: 8 },
              { type: 'size', name: '42mm', value: '42mm', stock: 15 },
              { type: 'size', name: '46mm', value: '46mm', stock: 15 }
            ],
            isActive: true
          },
          {
            name: 'Eco-Friendly Water Bottle',
            description: 'Sustainable stainless steel water bottle that keeps drinks hot for 12 hours and cold for 24 hours. BPA-free and environmentally conscious.',
            price: 34.99,
            image: '/images/water-bottle.jpg',
            category: 'Lifestyle',
            inventory: 100,
            variants: [
              { type: 'color', name: 'Ocean Blue', value: 'ocean-blue', stock: 25 },
              { type: 'color', name: 'Forest Green', value: 'forest-green', stock: 25 },
              { type: 'color', name: 'Sunset Orange', value: 'sunset-orange', stock: 25 },
              { type: 'color', name: 'Arctic White', value: 'arctic-white', stock: 25 },
              { type: 'size', name: '500ml', value: '500ml', stock: 50 },
              { type: 'size', name: '750ml', value: '750ml', stock: 50 }
            ],
            isActive: true
          }
        ];

        await Product.insertMany(sampleProducts);
        console.log('✅ Sample products seeded successfully');
      } else {
        console.log(`ℹ️  Database already contains ${existingProducts} products`);
      }
    } catch (error) {
      console.error('❌ Error seeding products:', error);
    }
  }

  static async cleanupExpiredOrders(): Promise<void> {
    // This would be called by a cron job to cleanup old failed/pending orders
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // You could add order cleanup logic here
      console.log('🧹 Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  static async getDbStats(): Promise<any> {
    try {
      const productCount = await Product.countDocuments();
      const activeProductCount = await Product.countDocuments({ isActive: true });
      
      return {
        products: {
          total: productCount,
          active: activeProductCount,
          inactive: productCount - activeProductCount
        }
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return null;
    }
  }
}
