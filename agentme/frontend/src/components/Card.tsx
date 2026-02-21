import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
}) => {
  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <div
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
};
