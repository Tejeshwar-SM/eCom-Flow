import React from 'react';
import { Customer, FormErrors } from '../types/index';
import { ValidationUtils } from '../utils/validation';
import Input from './ui/Input';

interface CustomerFormProps {
  data: Partial<Customer>;
  errors: FormErrors;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  data,
  errors,
  onChange,
  disabled = false,
}) => {
  // US States for dropdown
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = ValidationUtils.formatPhoneNumber(e.target.value);
    onChange('phone', formatted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={data.fullName || ''}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              error={errors.fullName}
              disabled={disabled}
              required
            />
          </div>

          <div>
            <label className="form-label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={data.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="Enter your email"
              error={errors.email}
              disabled={disabled}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            value={data.phone || ''}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            error={errors.phone}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">
              Street Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={data.address?.street || ''}
              onChange={(e) => onChange('address.street', e.target.value)}
              placeholder="Enter your street address"
              error={errors['address.street']}
              disabled={disabled}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={data.address?.city || ''}
                onChange={(e) => onChange('address.city', e.target.value)}
                placeholder="City"
                error={errors['address.city']}
                disabled={disabled}
                required
              />
            </div>

            <div>
              <label className="form-label">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={data.address?.state || ''}
                onChange={(e) => onChange('address.state', e.target.value)}
                className={`form-select ${errors['address.state'] ? 'form-input-error' : ''}`}
                disabled={disabled}
                required
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors['address.state'] && (
                <p className="form-error">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors['address.state']}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={data.address?.zipCode || ''}
                onChange={(e) => onChange('address.zipCode', e.target.value)}
                placeholder="12345"
                error={errors['address.zipCode']}
                disabled={disabled}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Country</label>
            <select
              value={data.address?.country || 'United States'}
              onChange={(e) => onChange('address.country', e.target.value)}
              className="form-select"
              disabled={disabled}
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Secure Information</p>
            <p>Your personal information is encrypted and will only be used to process your order.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
