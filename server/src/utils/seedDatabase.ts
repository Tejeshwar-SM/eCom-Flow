import mongoose from 'mongoose';
import { ProductModel } from '../models/Product';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 299.99,
    image: "/product-images/headphones.jpg",
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Black", "White", "Silver", "Blue"]
      },
      {
        type: "style",
        name: "Style",
        options: ["Over-ear", "On-ear"]
      }
    ],
    inventory: 50
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration. Water resistant up to 50 meters.",
    price: 249.99,
    image: "/product-images/smartwatch.jpg",
    variants: [
      {
        type: "color",
        name: "Band Color",
        options: ["Black", "Navy", "Pink", "Green"]
      },
      {
        type: "size",
        name: "Size",
        options: ["38mm", "42mm", "44mm"]
      }
    ],
    inventory: 30
  },
  {
    name: "Ergonomic Office Chair",
    description: "Professional ergonomic office chair with lumbar support, adjustable height, and breathable mesh back. Perfect for long work sessions.",
    price: 399.99,
    image: "/product-images/office-chair.jpg",
    variants: [
      {
        type: "color",
        name: "Color",
        options: ["Black", "Gray", "White"]
      },
      {
        type: "size",
        name: "Size",
        options: ["Standard", "Tall"]
      }
    ],
    inventory: 25
  }
];

const seedDatabase = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    // Clear existing products
    await ProductModel.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    // Insert sample products
    const insertedProducts = await ProductModel.insertMany(sampleProducts);
    console.log(`✅ Inserted ${insertedProducts.length} sample products`);
    
    console.log('Sample products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price} (ID: ${product._id})`);
    });
    
    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
