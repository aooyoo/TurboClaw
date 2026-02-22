import React from 'react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-mono btn-terminal transition-all focus:outline-none';

  const variants = {
    default: 'bg-[var(--color-btn-bg)] text-[var(--color-btn-fg)] hover:bg-[var(--color-accent)]',
    secondary: 'bg-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-dim)]',
    outline: 'border border-[var(--color-border)] text-[var(--color-fg)] hover:border-[var(--color-accent)]',
    ghost: 'text-[var(--color-fg)] hover:bg-[var(--color-border)]',
    danger: 'bg-[var(--color-error)] text-white hover:opacity-80',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
