import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  helperText,
  error,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        className={clsx(
          'w-full px-3 py-2 rounded border transition-colors duration-200',
          'bg-surface-primary text-text-primary placeholder-text-muted',
          'border-border-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
          error && 'border-accent-error focus:border-accent-error focus:ring-accent-error',
          className
        )}
      />
      {error && (
        <p className="text-accent-error text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-text-muted text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
