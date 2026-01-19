import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ' +
      'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ' +
      'hover:scale-105 active:scale-[0.98]'

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-gradient-primary text-white hover:shadow-lg hover:shadow-brand-primary/50',
      secondary:
        'bg-gradient-secondary text-white hover:shadow-lg hover:shadow-brand-secondary/50',
      ghost:
        'bg-transparent text-text hover:bg-bg-secondary active:bg-bg-tertiary',
      danger:
        'bg-error text-white hover:bg-error/90 hover:shadow-lg hover:shadow-error/50',
      outline:
        'border-2 border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary hover:text-white',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    }

    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
