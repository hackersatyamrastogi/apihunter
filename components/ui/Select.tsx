import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export function Select({
  label,
  helperText,
  error,
  options,
  placeholder,
  fullWidth = true,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          id={selectId}
          className={clsx(
            'w-full px-3 py-2 rounded border transition-colors duration-200',
            'bg-surface-primary text-text-primary appearance-none',
            'border-border-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
            error && 'border-accent-error focus:border-accent-error focus:ring-accent-error',
            'pr-10',
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none"
          size={18}
        />
      </div>
      {error && (
        <p className="text-accent-error text-sm mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-text-muted text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
