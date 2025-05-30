import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderApi } from '../services/orderApi';
import { Order } from '../types';
import { FormattingUtils } from '../utils/formatting';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ThankYou: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      toast.error('Invalid order number');
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getOrder(orderNumber);

        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          throw new Error(response.message || 'Order not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load order';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Store
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'declined':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Order Confirmed!',
          message: 'Your payment was successful and your order is being processed.',
          color: 'text-green-600'
        };
      case 'declined':
        return {
          title: 'Payment Declined',
          message: 'Your payment was declined. Please try again with a different payment method.',
          color: 'text-red-600'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: 'There was an error processing your payment. Please try again.',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Order Recorded',
          message: 'Your order has been recorded. Payment status is pending.',
          color: 'text-yellow-600'
        };
    }
  };

  const statusInfo = getStatusMessage(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-custom py-6">
          <div className="text-center">
            {getStatusIcon(order.status)}
            <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
              {statusInfo.title}
            </h1>
            <p className="text-gray-600 text-lg">{statusInfo.message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500">
              Order Date: {FormattingUtils.formatDateTime(order.createdAt || new Date())}
            </p>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Order Summary */}
          <Card variant="elevated">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={order.product.image}
                    alt={order.product.name}
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/128x128?text=Product';
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">{order.product.name}</h3>
                  
                  {order.product.selectedVariants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {order.product.selectedVariants.map((variant) => (
                        <span
                          key={`${variant.type}-${variant.value}`}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize"
                        >
                          {variant.type}: {variant.value}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-2 font-medium">{order.product.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unit Price:</span>
                      <span className="ml-2 font-medium">
                        {FormattingUtils.formatCurrency(order.product.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="ml-2 font-medium">
                        {FormattingUtils.formatCurrency(order.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{FormattingUtils.formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span>{FormattingUtils.formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span>{FormattingUtils.formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <Card variant="elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{order.customer.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{order.customer.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card variant="elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium">{order.customer.fullName}</p>
                  <p>{order.customer.address.street}</p>
                  <p>
                    {order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}
                  </p>
                  <p>{order.customer.address.country}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Information */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="ml-2 font-medium">Credit Card ending in {order.paymentInfo.cardNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Cardholder:</span>
                  <span className="ml-2 font-medium">{order.paymentInfo.cardholderName}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          {order.status === 'approved' && (
            <Card className="bg-green-50 border-green-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">What's Next?</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <p>✅ Your order is confirmed and being processed</p>
                  <p>📧 You'll receive an email confirmation shortly</p>
                  <p>📦 We'll send you tracking information once your order ships</p>
                  <p>🚚 Estimated delivery: 3-5 business days</p>
                </div>
              </div>
            </Card>
          )}

          {(order.status === 'declined' || order.status === 'failed') && (
            <Card className="bg-red-50 border-red-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Need Help?</h3>
                <div className="space-y-2 text-sm text-red-700">
                  <p>❌ Your payment could not be processed</p>
                  <p>💳 Please check your payment method and try again</p>
                  <p>📞 Contact support if you continue to have issues</p>
                  <p>🔄 You can place a new order anytime</p>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full sm:w-auto"
            >
              Continue Shopping
            </Button>
            
            {(order.status === 'declined' || order.status === 'failed') && (
              <Button
                variant="outline"
                onClick={() => {
                  navigate('/');
                  toast('Feel free to try ordering again');
                }}
                size="lg"
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
            )}
          </div>

          {/* Support Contact */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Support?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Our customer service team is here to help with any questions about your order.
              </p>
              <div className="text-sm text-blue-600 space-y-1">
                <p>📧 Email: support@ecommerce.com</p>
                <p>📞 Phone: 1-800-ECOMMERCE</p>
                <p>💬 Live Chat: Available 24/7</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
