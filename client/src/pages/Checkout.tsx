import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useOrder } from '../contexts/OrderContext';
import { Customer, PaymentInfo } from '../types/index';
import { orderApi } from '../services/orderApi';
import { paymentApi } from '../services/paymentApi';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProduct, quantity, selectedVariants, total, clearOrder } = useOrder();
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no product selected
  useEffect(() => {
    if (!selectedProduct) {
      toast.error('No product selected. Redirecting to store...');
      navigate('/');
    }
  }, [selectedProduct, navigate]);

  const handleOrderSubmission = async (customerData: Customer, paymentData: PaymentInfo) => {
    if (!selectedProduct) {
      toast.error('No product selected');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Step 1: Process payment
      toast.loading('Processing payment...', { id: 'payment-processing' });
      
      const paymentResult = await paymentApi.processPayment({
        amount: total,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv || '',
        cardholderName: paymentData.cardholderName,
      });

      toast.dismiss('payment-processing');

      // Step 2: Create order with payment result
      const orderData = {
        customer: customerData,
        product: {
          productId: selectedProduct._id,
          quantity: quantity,
          selectedVariants: selectedVariants,
        },
        paymentInfo: {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cardholderName: paymentData.cardholderName,
          cvv: paymentData.cvv || '',
        },
        transactionResult: paymentResult.data?.result || 'error',
      };

      console.log('📤 Final order payload:', JSON.stringify(orderData, null, 2));

      // Step 3: Submit order
      toast.loading('Creating order...', { id: 'order-creation' });
      
      const orderResult = await orderApi.createOrder(orderData);
      
      toast.dismiss('order-creation');

      if (orderResult.success && orderResult.data) {
        // Clear order context
        clearOrder();
        
        // Show success message
        if (paymentResult.data?.result === 'approved') {
          toast.success('Order placed successfully!');
        } else {
          toast.error('Payment failed, but order was recorded');
        }
        
        // Navigate to thank you page
        navigate(`/thank-you/${orderResult.data.orderNumber}`);
      } else {
        throw new Error(orderResult.message || 'Failed to create order');
      }

    } catch (err) {
      console.error('❌ Order submission error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Show specific error messages based on error type
      if (errorMessage.includes('payment')) {
        toast.error('Payment processing failed. Please try again.');
      } else if (errorMessage.includes('inventory') || errorMessage.includes('stock')) {
        toast.error('Product is no longer available in the requested quantity.');
      } else if (errorMessage.includes('Validation failed')) {
        toast.error('Please check your information and try again.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading if no product
  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600 mt-1">Complete your purchase</p>
            </div>
            
            {/* Back to Store */}
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isProcessing}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Store
            </Button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {/* Error Banner */}
        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <div className="flex items-center p-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Order Processing Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-7">
            <CheckoutForm
              onSubmit={handleOrderSubmission}
              isProcessing={isProcessing}
              disabled={isProcessing}
            />
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <OrderSummary
                product={selectedProduct}
                quantity={quantity}
                selectedVariants={selectedVariants}
                isProcessing={isProcessing}
              />
              
              {/* Security Notice */}
              <Card className="mt-6 bg-blue-50 border border-blue-200">
                <div className="p-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Secure Checkout</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your payment information is encrypted and secure. We never store your full card details.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-sm w-full mx-4">
            <div className="p-6 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Order</h3>
              <p className="text-gray-600">
                Please don't close this page while we process your payment and create your order.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Checkout;