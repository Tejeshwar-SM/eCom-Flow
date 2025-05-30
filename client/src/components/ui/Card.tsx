import React from 'react';
import { BaseComponentProps } from '../../types/index';

interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void; // Optional click handler
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}) => {
  // Base classes
  const baseClasses = 'bg-white rounded-lg';

  // Variant classes
  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-lg',
    bordered: 'border border-gray-200 shadow-sm',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Combine classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
