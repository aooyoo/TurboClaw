import React from 'react';
import { cn } from '../lib/utils';

export interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (val: string) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex border-b border-[var(--color-border)]', className)}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
}) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { value: selectedValue, setValue } = context;
  const isActive = selectedValue === value;

  return (
    <button
      className={cn(
        'font-mono text-sm px-3 py-2 relative transition-colors',
        'text-[var(--color-dim)] hover:text-[var(--color-fg)]',
        'focus:outline-none',
        isActive && 'text-[var(--color-fg)]',
        className
      )}
      onClick={() => setValue(value)}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
      )}
    </button>
  );
};

export const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { value: selectedValue } = context;
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return <div className={cn('mt-4', className)}>{children}</div>;
};
