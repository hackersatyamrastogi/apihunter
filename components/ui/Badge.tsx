import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-surface-secondary text-text-primary border border-border-secondary',
    success: 'bg-green-900 text-accent-success border border-accent-success',
    warning: 'bg-orange-900 text-accent-warning border border-accent-warning',
    error: 'bg-red-900 text-accent-error border border-accent-error',
    info: 'bg-cyan-900 text-accent-info border border-accent-info',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
  };

  return (
    <span
      {...props}
      className={clsx(
        'inline-flex items-center rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Convenience components for common badge types
export function SuccessBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="success" {...props}>{children}</Badge>;
}

export function ErrorBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="error" {...props}>{children}</Badge>;
}

export function WarningBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="warning" {...props}>{children}</Badge>;
}

export function InfoBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) {
  return <Badge variant="info" {...props}>{children}</Badge>;
}
