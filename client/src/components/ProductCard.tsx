import React from 'react';
import { Product } from '../types';
import Card from './ui/Card';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:bg-gray-50'
      }`}
      padding="none"
      onClick={onSelect}
    >
      <div className="flex items-center p-4">
        {/* Product Image */}
        <div className="flex-shrink-0 w-20 h-20 mr-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/80x80?text=Product';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            
            <div className="flex items-center text-sm">
              {product.inventory > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-green-700">In Stock</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  <span className="text-red-700">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Variants Preview */}
          {product.variants.length > 0 && (
            <div className="flex items-center mt-2 space-x-2">
              <span className="text-xs text-gray-500">Options:</span>
              {[...new Set(product.variants.map(v => v.type))].map(type => (
                <span key={type} className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
