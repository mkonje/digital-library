// src/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-sm focus:ring-terracotta-500 dark:bg-terracotta-500 dark:hover:bg-terracotta-600',
    secondary: 'bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-sm focus:ring-charcoal-700 dark:bg-charcoal-100 dark:text-charcoal-900 dark:hover:bg-white',
    outline: 'border border-charcoal-200 dark:border-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-900 text-charcoal-800 dark:text-charcoal-200 focus:ring-charcoal-400',
    ghost: 'hover:bg-charcoal-100 dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 focus:ring-charcoal-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
