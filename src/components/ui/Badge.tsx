// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'premium' | 'free' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-0.5 font-medium tracking-wide',
  };

  const variantStyles = {
    default: 'bg-warm-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300 border border-warm-200 dark:border-charcoal-700',
    premium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    free: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    success: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30',
    neutral: 'bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-400',
  };

  return (
    <span
      className={`inline-flex items-center uppercase rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
