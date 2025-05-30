import React, { useState, useEffect } from 'react';
import { PaymentInfo, FormErrors } from '../types/index';
import { ValidationUtils } from '../utils/validation';
import Input from './ui/Input';

interface PaymentFormProps {
  data: Partial<PaymentInfo>;
  errors: FormErrors;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  data,
  errors,
  onChange,
  disabled = false,
}) => {
  const [cardType, setCardType] = useState<string>('');

  // Update card type when card number changes
  useEffect(() => {
    if (data.cardNumber) {
      const detectedType = ValidationUtils.getCardType(data.cardNumber);
      setCardType(detectedType);
    } else {
      setCardType('');
    }
  }, [data.cardNumber]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = ValidationUtils.formatCardNumber(e.target.value);
    onChange('cardNumber', formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = ValidationUtils.formatExpiryDate(e.target.value);
    onChange('expiryDate', formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const maxLength = cardType === 'amex' ? 4 : 3;
    onChange('cvv', value.slice(0, maxLength));
  };

  const getCardIcon = (type: string) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      unknown: '💳'
    };
    return icons[type as keyof typeof icons] || icons.unknown;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="form-label">
              Card Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                value={data.cardNumber || ''}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                error={errors.cardNumber}
                disabled={disabled}
                required
                className="pr-12"
              />
              {cardType && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-lg" title={cardType}>
                    {getCardIcon(cardType)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={data.expiryDate || ''}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                error={errors.expiryDate}
                disabled={disabled}
                required
              />
            </div>

            <div>
              <label className="form-label">
                CVV <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={data.cvv || ''}
                  onChange={handleCvvChange}
                  placeholder={cardType === 'amex' ? '1234' : '123'}
                  error={errors.cvv}
                  disabled={disabled}
                  required
                  className="pr-8"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="form-label">
              Cardholder Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={data.cardholderName || ''}
              onChange={(e) => onChange('cardholderName', e.target.value)}
              placeholder="Name as it appears on card"
              error={errors.cardholderName}
              disabled={disabled}
              required
            />
          </div>
        </div>
      </div>

      {/* Test Card Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-amber-700">
            <p className="font-medium">Test Mode</p>
            <p>This is a demo. Use these test card numbers:</p>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p>• 4242424242424242 (Visa - Approved)</p>
              <p>• 4000000000000002 (Visa - Declined)</p>
              <p>• 4000000000000010 (Visa - Gateway Error)</p>
              <p>• Any future expiry date and 3-digit CVV</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-green-700">
            <p className="font-medium">SSL Secured</p>
            <p>Your payment information is encrypted using 256-bit SSL encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
