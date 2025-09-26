import React from 'react';
import { cn } from '@/lib/utils';
import { componentClasses } from '@/lib/design-tokens';

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl', 
  lg: 'px-8 py-4 text-lg rounded-2xl'
};

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseClass = componentClasses.button[variant];
    const sizeClass = sizeClasses[size];
    
    return (
      <button
        ref={ref}
        className={cn(
          baseClass,
          sizeClass,
          disabled && 'opacity-50 cursor-not-allowed hover:shadow-md',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
EnhancedButton.displayName = 'EnhancedButton';