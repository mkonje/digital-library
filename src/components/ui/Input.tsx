// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-charcoal-100 text-sm placeholder:text-charcoal-400 dark:placeholder:text-charcoal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 py-2.5 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-charcoal-200 dark:border-charcoal-800'
            } ${className}`}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
