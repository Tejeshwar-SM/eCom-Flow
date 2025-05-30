import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useOrder } from '../contexts/OrderContext';
import { Product, SelectedVariant } from '../types';
import { productApi } from '../services/productApi';
import ProductCard from '../components/ProductCard';
import VariantSelector from '../components/VariantSelector';
import QuantitySelector from '../components/QuantitySelector';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { setProductSelection } = useOrder();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [buyLoading, setBuyLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-select first product when products load
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      handleProductSelect(products[0]);
    }
  }, [products, selectedProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productApi.getProducts();
      
      if (response.success && response.data) {
        setProducts(response.data.products);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    
    // Auto-select first variant of each type
    const defaultVariants: SelectedVariant[] = [];
    const variantTypes = [...new Set(product.variants.map(v => v.type))];
    
    variantTypes.forEach(type => {
      const firstVariant = product.variants.find(v => v.type === type);
      if (firstVariant) {
        defaultVariants.push({
          type: firstVariant.type,
          value: firstVariant.value
        });
      }
    });
    
    setSelectedVariants(defaultVariants);
  };

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants(prev => {
      const updated = prev.filter(v => v.type !== type);
      updated.push({ type, value });
      return updated;
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedProduct && newQuantity > 0 && newQuantity <= selectedProduct.inventory) {
      setQuantity(newQuantity);
    }
  };

  const checkAvailability = async (): Promise<boolean> => {
    if (!selectedProduct) return false;
    
    try {
      const response = await productApi.checkAvailability(
        selectedProduct._id,
        quantity,
        selectedVariants
      );
      
      return response.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Availability check failed';
      toast.error(errorMessage);
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    // Validate variant selection
    const requiredVariantTypes = [...new Set(selectedProduct.variants.map(v => v.type))];
    const selectedVariantTypes = selectedVariants.map(v => v.type);
    
    const missingVariants = requiredVariantTypes.filter(type => 
      !selectedVariantTypes.includes(type)
    );
    
    if (missingVariants.length > 0) {
      toast.error(`Please select: ${missingVariants.join(', ')}`);
      return;
    }

    try {
      setBuyLoading(true);
      
      // Check availability before proceeding
      const isAvailable = await checkAvailability();
      
      if (!isAvailable) {
        toast.error('Selected quantity is not available');
        return;
      }

      // Set order context and navigate
      setProductSelection(selectedProduct, quantity, selectedVariants);
      
      toast.success('Product added! Proceeding to checkout...');
      
      // Small delay for better UX
      setTimeout(() => {
        navigate('/checkout');
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to proceed to checkout';
      toast.error(errorMessage);
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Products</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadProducts} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2M9 13h2m0 0V9a2 2 0 012-2h2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Products Available</h2>
          <p className="text-gray-600">There are no products available at the moment.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-gray-900">Premium Store</h1>
          <p className="text-gray-600 mt-1">Discover amazing products at great prices</p>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product List - Left Side */}
          <div className="lg:col-span-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Product</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isSelected={selectedProduct?._id === product._id}
                  onSelect={() => handleProductSelect(product)}
                />
              ))}
            </div>
          </div>

          {/* Product Details - Right Side */}
          <div className="lg:col-span-7">
            {selectedProduct ? (
              <Card variant="elevated" className="sticky top-8">
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-12 mb-6">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-80 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h1>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {/* Variants */}
                  {selectedProduct.variants.length > 0 && (
                    <VariantSelector
                      product={selectedProduct}
                      selectedVariants={selectedVariants}
                      onVariantChange={handleVariantChange}
                    />
                  )}

                  {/* Quantity */}
                  <QuantitySelector
                    quantity={quantity}
                    maxQuantity={Math.min(selectedProduct.inventory, 10)}
                    onQuantityChange={handleQuantityChange}
                  />

                  {/* Stock Info */}
                  <div className="flex items-center text-sm">
                    {selectedProduct.inventory > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-green-700">
                          {selectedProduct.inventory} in stock
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-red-700">Out of stock</span>
                      </>
                    )}
                  </div>

                  {/* Buy Button */}
                  <Button
                    onClick={handleBuyNow}
                    loading={buyLoading}
                    disabled={selectedProduct.inventory === 0}
                    className="w-full text-lg py-3"
                    size="lg"
                  >
                    {buyLoading ? 'Processing...' : 'Buy Now'}
                  </Button>

                  {/* Additional Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Free shipping on orders over $50</p>
                    <p>✓ 30-day return policy</p>
                    <p>✓ Secure checkout with SSL encryption</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
                <p className="text-gray-600">Choose a product from the list to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
