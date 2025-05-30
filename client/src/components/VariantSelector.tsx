import React from 'react';
import { Product, SelectedVariant } from '../types/index';

interface VariantSelectorProps {
  product: Product;
  selectedVariants: SelectedVariant[];
  onVariantChange: (type: string, value: string) => void;
}

const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedVariants,
  onVariantChange,
}) => {
  // Group variants by type
  const variantsByType = product.variants.reduce((acc, variant) => {
    if (!acc[variant.type]) {
      acc[variant.type] = [];
    }
    acc[variant.type].push(variant);
    return acc;
  }, {} as Record<string, typeof product.variants>);

  const getSelectedValue = (type: string): string => {
    const selected = selectedVariants.find(v => v.type === type);
    return selected?.value || '';
  };

  const isVariantAvailable = (type: string, value: string): boolean => {
    const variant = product.variants.find(v => v.type === type && v.value === value);
    return variant ? variant.stock > 0 : false;
  };

  return (
    <div className="space-y-4">
      {Object.entries(variantsByType).map(([type, variants]) => {
        const selectedValue = getSelectedValue(type);

        return (
          <div key={type}>
            <h4 className="text-sm font-medium text-gray-900 mb-2 capitalize">
              Select {type}
            </h4>
            
            {type === 'color' ? (
              // Color swatches
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedValue === variant.value;
                  const isAvailable = isVariantAvailable(type, variant.value);
                  
                  return (
                    <button
                      key={variant.value}
                      onClick={() => onVariantChange(type, variant.value)}
                      disabled={!isAvailable}
                      className={`
                        relative w-10 h-10 rounded-full border-2 transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                        }
                        ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{
                        backgroundColor: getColorValue(variant.value)
                      }}
                      title={`${variant.name} ${!isAvailable ? '(Out of stock)' : ''}`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg 
                            className="w-5 h-5 text-white drop-shadow-lg" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Regular buttons for other variants (size, etc.)
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedValue === variant.value;
                  const isAvailable = isVariantAvailable(type, variant.value);
                  
                  return (
                    <button
                      key={variant.value}
                      onClick={() => onVariantChange(type, variant.value)}
                      disabled={!isAvailable}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }
                        ${!isAvailable 
                          ? 'opacity-50 cursor-not-allowed line-through' 
                          : 'cursor-pointer'
                        }
                      `}
                    >
                      {variant.name}
                      {!isAvailable && (
                        <span className="text-xs ml-1">(Out of stock)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Stock info for selected variant */}
            {selectedValue && (
              <div className="mt-2 text-xs text-gray-600">
                {(() => {
                  const variant = variants.find(v => v.value === selectedValue);
                  if (!variant) return null;
                  
                  if (variant.stock === 0) {
                    return (
                      <span className="text-red-600">Selected variant is out of stock</span>
                    );
                  } else if (variant.stock <= 5) {
                    return (
                      <span className="text-amber-600">Only {variant.stock} left in stock</span>
                    );
                  } else {
                    return (
                      <span className="text-green-600">In stock ({variant.stock} available)</span>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get color value for CSS
const getColorValue = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'space-gray': '#4B5563',
    'blue': '#3B82F6',
    'ocean-blue': '#0EA5E9',
    'navy': '#1E3A8A',
    'red': '#EF4444',
    'green': '#10B981',
    'forest-green': '#059669',
    'yellow': '#F59E0B',
    'orange': '#F97316',
    'sunset-orange': '#EA580C',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'rose-gold': '#F59E0B',
    'silver': '#E5E7EB',
    'gold': '#D97706',
    'brown': '#92400E',
    'charcoal-black': '#1F2937',
    'arctic-white': '#F9FAFB',
  };
  
  return colorMap[colorName.toLowerCase()] || '#6B7280';
};

export default VariantSelector;
