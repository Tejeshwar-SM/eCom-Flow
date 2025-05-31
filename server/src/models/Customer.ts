import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer, IAddress } from '../types';

interface ICustomerDocument extends ICustomer, Document {}

// ✅ Custom validator for international postal codes
const validatePostalCode = function(this: IAddress, value: string): boolean {
  if (!value || value.trim() === '') return false;
  
  const cleanValue = value.trim().toUpperCase();
  const country = this.country || '';
  
  // Country-specific postal code patterns
  const patterns: { [key: string]: RegExp } = {
    'India': /^[1-9]\d{5}$/, // 6 digits, cannot start with 0
    'United States': /^\d{5}(-\d{4})?$/, // ZIP codes
    'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, // Postal codes
    'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, // Postcodes
    'Australia': /^\d{4}$/, // 4 digits
    'Germany': /^\d{5}$/, // 5 digits
    'France': /^\d{5}$/, // 5 digits
    'Japan': /^\d{3}-\d{4}$/, // XXX-XXXX
    'Brazil': /^\d{5}-?\d{3}$/, // XXXXX-XXX
    'Netherlands': /^\d{4}\s?[A-Z]{2}$/i, // XXXX AA
    'Spain': /^\d{5}$/, // 5 digits
    'Italy': /^\d{5}$/, // 5 digits
    'China': /^\d{6}$/, // 6 digits
    'South Korea': /^\d{5}$/, // 5 digits
    'Russia': /^\d{6}$/, // 6 digits
    'Mexico': /^\d{5}$/, // 5 digits
    'Argentina': /^[A-Z]?\d{4}[A-Z]{3}$/i, // XXXX AAA
    'South Africa': /^\d{4}$/, // 4 digits
    'Switzerland': /^\d{4}$/, // 4 digits
    'Sweden': /^\d{3}\s?\d{2}$/, // XXX XX
    'Norway': /^\d{4}$/, // 4 digits
    'Denmark': /^\d{4}$/, // 4 digits
    'Finland': /^\d{5}$/, // 5 digits
    'Belgium': /^\d{4}$/, // 4 digits
    'Austria': /^\d{4}$/, // 4 digits
  };
  
  if (country && patterns[country]) {
    return patterns[country].test(cleanValue);
  }
  
  // Generic validation for unknown countries (alphanumeric, 3-10 chars)
  return /^[A-Z0-9\s-]{3,10}$/i.test(cleanValue);
};

// ✅ Custom validator for international phone numbers
const validatePhone = function(value: string): boolean {
  if (!value || value.trim() === '') return false;
  
  // Basic international phone validation
  // Accepts +country_code followed by digits, spaces, hyphens, parentheses
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
  return phoneRegex.test(value.trim());
};

const AddressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State/Province is required'],
    trim: true,
    maxlength: [100, 'State/Province name cannot exceed 100 characters']
  },
  // ✅ Updated postal code validation for international support
  zipCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    validate: {
      validator: validatePostalCode,
      message: function(props: any) {
        const country = props.instance?.address?.country || '';
        const label = country === 'India' ? 'PIN code' : 
                     country === 'United States' ? 'ZIP code' : 'postal code';
        return `Please enter a valid ${label}`;
      }
    }
  },
  // ✅ Updated country default
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    default: 'India', // ✅ Changed from 'United States' to 'India'
    maxlength: [100, 'Country name cannot exceed 100 characters']
  }
}, { _id: false });

const CustomerSchema = new Schema<ICustomerDocument>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  // ✅ Updated phone validation for international support
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: validatePhone,
      message: 'Please enter a valid international phone number (include country code)'
    }
  },
  address: {
    type: AddressSchema,
    required: [true, 'Address is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });

// ✅ Updated virtual for formatted address with international support
CustomerSchema.virtual('formattedAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

export default mongoose.model<ICustomerDocument>('Customer', CustomerSchema);
