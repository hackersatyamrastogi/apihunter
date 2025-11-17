import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({
  children,
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        'bg-surface-primary border border-border-primary rounded-lg p-6',
        hoverable && 'hover:border-accent-primary hover:shadow-md transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div {...props} className={clsx('mb-4 pb-4 border-b border-border-primary', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div {...props} className={clsx('', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div {...props} className={clsx('mt-4 pt-4 border-t border-border-primary flex gap-2', className)}>
      {children}
    </div>
  );
}
