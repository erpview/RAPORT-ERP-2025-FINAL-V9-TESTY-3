import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  component?: typeof Link;
};

type ButtonProps = ButtonBaseProps & 
  (
    | (Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>)
    | (Omit<React.ComponentProps<typeof Link>, keyof ButtonBaseProps>)
  );

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className, children, component: Component, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthStyles = fullWidth ? 'w-full' : '';
    const styles = twMerge(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className
    );

    if (Component === Link) {
      return (
        <Component
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={styles}
          {...props as React.ComponentProps<typeof Link>}
        >
          {children}
        </Component>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={styles}
        {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
