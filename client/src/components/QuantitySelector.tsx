import React from 'react';
import Button from './ui/Button';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  minQuantity?: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  maxQuantity,
  minQuantity = 1,
  onQuantityChange,
  disabled = false,
}) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">Quantity</h4>
      
      <div className="flex items-center space-x-3">
        {/* Decrease Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          disabled={disabled || quantity <= minQuantity}
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </Button>

        {/* Quantity Input */}
        <div className="relative">
          <input
            type="number"
            min={minQuantity}
            max={maxQuantity}
            value={quantity}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-16 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Increase Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={disabled || quantity >= maxQuantity}
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Button>

        {/* Quantity Info */}
        <div className="text-sm text-gray-600">
          {maxQuantity > 0 ? (
            <span>
              Max: {maxQuantity}
            </span>
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>
      </div>

      {/* Stock Warning */}
      {maxQuantity > 0 && maxQuantity <= 5 && (
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ Only {maxQuantity} items left in stock
        </p>
      )}
    </div>
  );
};

export default QuantitySelector;
