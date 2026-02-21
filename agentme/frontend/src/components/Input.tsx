import React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-small-strong text-[var(--color-dim)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={cn(
          'font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)]',
          'text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
          'focus:outline-none focus:border-[var(--color-accent)]',
          'transition-colors px-2 py-1.5',
          className
        )}
        {...props}
      />
    </div>
  );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-small-strong text-[var(--color-dim)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'font-mono text-sm bg-[var(--color-bg)] border border-[var(--color-border)]',
          'text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
          'focus:outline-none focus:border-[var(--color-accent)]',
          'transition-colors px-2 py-1.5 resize-none',
          className
        )}
        {...props}
      />
    </div>
  );
};
