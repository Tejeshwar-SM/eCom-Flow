import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import { Country, State } from 'country-state-city';
import { Customer, FormErrors } from '../types/index';
import { ValidationUtils } from '../utils/validation';
import Input from './ui/Input';
import 'react-phone-number-input/style.css';

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
  // Get all countries and states
  const countries = Country.getAllCountries();
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  // Initialize with current country or default to India
  useEffect(() => {
    const currentCountryCode = data.address?.country;
    let country;
    
    if (currentCountryCode) {
      country = countries.find(c => c.name === currentCountryCode || c.isoCode === currentCountryCode);
    } else {
      // Default to India
      country = countries.find(c => c.isoCode === 'IN');
    }
    
    if (country) {
      setSelectedCountry(country);
      updateStatesForCountry(country.isoCode);
      if (!currentCountryCode) {
        onChange('address.country', country.name);
      }
    }
  }, [data.address?.country, countries]);

  const updateStatesForCountry = (countryCode: string) => {
    const countryStates = State.getStatesOfCountry(countryCode);
    setStates(countryStates || []);
    
    // Clear state if it doesn't exist in new country
    if (data.address?.state && countryStates) {
      const stateExists = countryStates.some(s => s.name === data.address?.state);
      if (!stateExists) {
        onChange('address.state', '');
      }
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    const country = countries.find(c => c.name === countryName);
    
    if (country) {
      setSelectedCountry(country);
      updateStatesForCountry(country.isoCode);
      onChange('address.country', countryName);
      onChange('address.state', ''); // Reset state when country changes
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    onChange('phone', value || '');
  };

  // Get postal code label based on country
  const getPostalCodeLabel = () => {
    if (!selectedCountry) return 'Postal Code';
    
    switch (selectedCountry.isoCode) {
      case 'IN': return 'PIN Code';
      case 'US': return 'ZIP Code';
      case 'CA': return 'Postal Code';
      case 'GB': return 'Postcode';
      case 'AU': return 'Postcode';
      case 'DE': return 'Postleitzahl';
      case 'FR': return 'Code Postal';
      default: return 'Postal Code';
    }
  };

  // Get postal code placeholder based on country
  const getPostalCodePlaceholder = () => {
    if (!selectedCountry) return 'Enter postal code';
    
    switch (selectedCountry.isoCode) {
      case 'IN': return '110001';
      case 'US': return '12345';
      case 'CA': return 'K1A 0A6';
      case 'GB': return 'SW1A 1AA';
      case 'AU': return '2000';
      case 'DE': return '10115';
      case 'FR': return '75001';
      default: return 'Enter postal code';
    }
  };

  // Get state/province label based on country
  const getStateLabel = () => {
    if (!selectedCountry) return 'State';
    
    switch (selectedCountry.isoCode) {
      case 'IN': return 'State';
      case 'US': return 'State';
      case 'CA': return 'Province';
      case 'GB': return 'County';
      case 'AU': return 'State';
      case 'DE': return 'State';
      case 'FR': return 'Region';
      default: return 'State/Province';
    }
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
          <div className="relative">
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="IN"
              value={data.phone || ''}
              onChange={handlePhoneChange}
              disabled={disabled}
              placeholder="Enter phone number"
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              style={{
                '--PhoneInputCountryFlag-height': '1em',
                '--PhoneInputCountrySelectArrow-color': '#6b7280',
                '--PhoneInput-color--focus': '#3b82f6',
              } as any}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
        
        <div className="space-y-4">
          {/* Country Selection */}
          <div>
            <label className="form-label">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={data.address?.country || ''}
              onChange={handleCountryChange}
              className={`form-select ${errors['address.country'] ? 'form-input-error' : ''}`}
              disabled={disabled}
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.isoCode} value={country.name}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors['address.country'] && (
              <p className="form-error">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors['address.country']}
              </p>
            )}
          </div>

          {/* Street Address */}
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
            {/* City */}
            <div>
              <label className="form-label">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={data.address?.city || ''}
                onChange={(e) => onChange('address.city', e.target.value)}
                placeholder="Enter city"
                error={errors['address.city']}
                disabled={disabled}
                required
              />
            </div>

            {/* State/Province */}
            <div>
              <label className="form-label">
                {getStateLabel()} <span className="text-red-500">*</span>
              </label>
              {states.length > 0 ? (
                <select
                  value={data.address?.state || ''}
                  onChange={(e) => onChange('address.state', e.target.value)}
                  className={`form-select ${errors['address.state'] ? 'form-input-error' : ''}`}
                  disabled={disabled}
                  required
                >
                  <option value="">Select {getStateLabel()}</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.name}>
                      {state.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="text"
                  value={data.address?.state || ''}
                  onChange={(e) => onChange('address.state', e.target.value)}
                  placeholder={`Enter ${getStateLabel().toLowerCase()}`}
                  error={errors['address.state']}
                  disabled={disabled}
                  required
                />
              )}
              {errors['address.state'] && (
                <p className="form-error">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors['address.state']}
                </p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="form-label">
                {getPostalCodeLabel()} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={data.address?.zipCode || ''}
                onChange={(e) => onChange('address.zipCode', e.target.value)}
                placeholder={getPostalCodePlaceholder()}
                error={errors['address.zipCode']}
                disabled={disabled}
                required
              />
            </div>
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
            <p>Your personal information is encrypted and will only be used to process your order. We support customers worldwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerForm;
