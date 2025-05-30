import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product, SelectedVariant, Order, OrderContextType } from '../types/index';

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Custom hook to use the order context
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

// Provider component
interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Tax rate (8%)
  const TAX_RATE = 0.08;

  // Computed values
  const subtotal = useMemo(() => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * quantity;
  }, [selectedProduct, quantity]);

  const tax = useMemo(() => {
    return Math.round(subtotal * TAX_RATE * 100) / 100;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.round((subtotal + tax) * 100) / 100;
  }, [subtotal, tax]);

  const orderTotal = useMemo(() => {
    return currentOrder ? currentOrder.total : total;
  }, [currentOrder, total]);

  // Actions
  const setProductSelection = useCallback((
    product: Product, 
    qty: number, 
    variants: SelectedVariant[]
  ) => {
    setSelectedProduct(product);
    setQuantity(qty);
    setSelectedVariants(variants);
  }, []);

  const updateQuantity = useCallback((newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  }, []);

  const updateVariants = useCallback((variants: SelectedVariant[]) => {
    setSelectedVariants(variants);
  }, []);

  const setCurrentOrderData = useCallback((order: Order) => {
    setCurrentOrder(order);
  }, []);

  const clearOrder = useCallback(() => {
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedVariants([]);
    setCurrentOrder(null);
  }, []);

  // Context value
  const contextValue: OrderContextType = {
    // Product Selection
    selectedProduct,
    quantity,
    selectedVariants,
    
    // Order State
    currentOrder,
    orderTotal,
    
    // Actions
    setProductSelection,
    updateQuantity,
    updateVariants,
    setCurrentOrder: setCurrentOrderData,
    clearOrder,
    
    // Computed Values
    subtotal,
    tax,
    total,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};
