import React, { useState } from 'react';
import { Customer, PaymentInfo, FormErrors } from '../types/index';
import { ValidationUtils } from '../utils/validation';
import CustomerForm from './CustomerForm';
import PaymentForm from './PaymentForm';
import Button from './ui/Button';
import Card from './ui/Card';

interface CheckoutFormProps {
  onSubmit: (customer: Customer, payment: PaymentInfo) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  isProcessing,
  disabled = false,
}) => {
  // Form data state
  const [customerData, setCustomerData] = useState<Partial<Customer>>({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });

  const [paymentData, setPaymentData] = useState<Partial<PaymentInfo>>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  // Validation state
  const [customerErrors, setCustomerErrors] = useState<FormErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Handle customer data changes
  const handleCustomerChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCustomerData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
      }));
    } else {
      setCustomerData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear field error when user starts typing
    if (customerErrors[field]) {
      setCustomerErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle payment data changes
  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (paymentErrors[field]) {
      setPaymentErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validate customer step
  const validateCustomerStep = (): boolean => {
    const errors = ValidationUtils.validateCustomer(customerData);
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate payment step
  const validatePaymentStep = (): boolean => {
    const errors = ValidationUtils.validatePaymentInfo(paymentData);
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (validateCustomerStep()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all data
    const customerValid = validateCustomerStep();
    const paymentValid = validatePaymentStep();

    if (customerValid && paymentValid) {
      onSubmit(customerData as Customer, paymentData as PaymentInfo);
    } else {
      // If payment step is invalid, go back to it
      if (!paymentValid) {
        setCurrentStep(2);
      }
    }
  };

  return (
    <Card variant="elevated">
      {/* Step Indicator */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center text-sm">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
              currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                '1'
              )}
            </div>
            <span className={currentStep >= 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              Customer Information
            </span>
          </div>

          <div className="flex-1 mx-4">
            <div className="h-px bg-gray-200"></div>
          </div>

          <div className="flex items-center text-sm">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
              currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={currentStep >= 2 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              Payment Information
            </span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {currentStep === 1 ? (
            <CustomerForm
              data={customerData}
              errors={customerErrors}
              onChange={handleCustomerChange}
              disabled={disabled}
            />
          ) : (
            <PaymentForm
              data={paymentData}
              errors={paymentErrors}
              onChange={handlePaymentChange}
              disabled={disabled}
            />
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            {currentStep === 1 ? (
              <div></div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={disabled}
              >
                Previous
              </Button>
            )}

            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={disabled}
              >
                Continue to Payment
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isProcessing}
                disabled={disabled}
                className="min-w-32"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
};

export default CheckoutForm;
