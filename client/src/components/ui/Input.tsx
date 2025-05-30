import React, { forwardRef } from 'react';
import { InputProps } from '../../types/index';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  name,
  value,
  placeholder,
  disabled = false,
  required = false,
  error,
  className = '',
  onChange,
  onBlur,
  ...props
}, ref) => {
  // Base classes
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200';

  // State classes
  const stateClasses = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500';

  // Disabled classes
  const disabledClasses = disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
    : 'bg-white hover:border-gray-400';

  // Combine classes
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;

  return (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
