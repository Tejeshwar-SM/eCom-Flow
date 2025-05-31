import React from 'react';
import { Product, SelectedVariant } from '../types/index';
import { FormattingUtils } from '../utils/formatting';
import Card from './ui/Card';

interface OrderSummaryProps {
  product: Product;
  quantity: number;
  selectedVariants: SelectedVariant[];
  isProcessing?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  product,
  quantity,
  selectedVariants,
  isProcessing = false,
}) => {
  // Calculate pricing
  const subtotal = product.price * quantity;
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const total = subtotal + tax;

  return (
    <Card variant="elevated">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        {/* Product Details */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-20 h-20">
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
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
              {product.name}
            </h4>
            
            <div className="mt-1 text-sm text-gray-500">
              Quantity: {quantity}
            </div>
            
            {selectedVariants.length > 0 && (
              <div className="mt-1">
                {selectedVariants.map((variant, _index) => (
                  <span
                    key={`${variant.type}-${variant.value}`}
                    className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-1 capitalize"
                  >
                    {variant.type}: {variant.value}
                  </span>
                ))}
              </div>
            )}
            
            <div className="mt-2 text-sm font-medium text-gray-900">
              {FormattingUtils.formatCurrency(product.price)} each
            </div>
          </div>
        </div>
        
        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{FormattingUtils.formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="text-gray-900">{FormattingUtils.formatCurrency(tax)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                {FormattingUtils.formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="animate-spin w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-blue-700">Processing your order...</span>
            </div>
          </div>
        )}
        
        {/* Shipping Info */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>🚚 Free standard shipping (3-5 business days)</p>
          <p>📦 Express shipping available at checkout</p>
          <p>🔄 30-day return policy</p>
          <p>🛡️ 1-year manufacturer warranty</p>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;
