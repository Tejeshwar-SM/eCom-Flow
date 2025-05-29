import Product from '../models/Product';
import { ISelectedVariant } from '../types';

class InventoryService {
  async reduceInventory(
    productId: string, 
    quantity: number, 
    selectedVariants: ISelectedVariant[] = []
  ): Promise<boolean> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if enough inventory is available
      if (product.inventory < quantity) {
        throw new Error('Insufficient inventory');
      }

      // Reduce main inventory
      product.inventory -= quantity;

      // Reduce variant stock if applicable
      if (selectedVariants.length > 0) {
        for (const selectedVariant of selectedVariants) {
          const variantIndex = product.variants.findIndex(
            v => v.type === selectedVariant.type && v.value === selectedVariant.value
          );
          
          if (variantIndex !== -1) {
            if (product.variants[variantIndex].stock < quantity) {
              throw new Error(`Insufficient stock for variant ${selectedVariant.type}: ${selectedVariant.value}`);
            }
            product.variants[variantIndex].stock -= quantity;
          }
        }
      }

      await product.save();
      console.log(`✅ Reduced inventory for product ${productId} by ${quantity}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to reduce inventory:', error);
      throw error;
    }
  }

  async increaseInventory(
    productId: string, 
    quantity: number, 
    selectedVariants: ISelectedVariant[] = []
  ): Promise<boolean> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Increase main inventory
      product.inventory += quantity;

      // Increase variant stock if applicable
      if (selectedVariants.length > 0) {
        for (const selectedVariant of selectedVariants) {
          const variantIndex = product.variants.findIndex(
            v => v.type === selectedVariant.type && v.value === selectedVariant.value
          );
          
          if (variantIndex !== -1) {
            product.variants[variantIndex].stock += quantity;
          }
        }
      }

      await product.save();
      console.log(`✅ Increased inventory for product ${productId} by ${quantity}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to increase inventory:', error);
      throw error;
    }
  }

  async checkAvailability(
    productId: string, 
    quantity: number, 
    selectedVariants: ISelectedVariant[] = []
  ): Promise<{ available: boolean; message?: string }> {
    try {
      const product = await Product.findById(productId);
      
      if (!product || !product.isActive) {
        return { available: false, message: 'Product not found or unavailable' };
      }

      // Check main inventory
      if (product.inventory < quantity) {
        return { 
          available: false, 
          message: `Only ${product.inventory} items available in stock` 
        };
      }

      // Check variant availability
      if (selectedVariants.length > 0) {
        for (const selectedVariant of selectedVariants) {
          const variant = product.variants.find(
            v => v.type === selectedVariant.type && v.value === selectedVariant.value
          );
          
          if (!variant) {
            return { 
              available: false, 
              message: `Variant ${selectedVariant.type}: ${selectedVariant.value} not available` 
            };
          }
          
          if (variant.stock < quantity) {
            return { 
              available: false, 
              message: `Only ${variant.stock} items available for ${selectedVariant.type}: ${selectedVariant.value}` 
            };
          }
        }
      }

      return { available: true };

    } catch (error) {
      console.error('❌ Failed to check availability:', error);
      return { available: false, message: 'Error checking availability' };
    }
  }
}

export const inventoryService = new InventoryService();
