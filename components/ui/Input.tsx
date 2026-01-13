import React, { useId } from 'react';
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
  const generatedId = useId();
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // Build aria-describedby based on what's present
  const describedBy = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

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
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={clsx(
          'w-full px-3 py-2.5 rounded border transition-colors duration-200 min-h-[44px]',
          'bg-surface-primary text-text-primary placeholder-text-muted',
          'border-border-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
          error && 'border-accent-error focus:border-accent-error focus:ring-accent-error',
          className
        )}
      />
      {error && (
        <p id={errorId} className="text-accent-error text-sm mt-1" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-text-muted text-sm mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
