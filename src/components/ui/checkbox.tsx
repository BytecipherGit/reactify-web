import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={cn(
            'mt-1 h-4 w-4 rounded border-border text-brand-primary',
            'focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm font-medium text-text',
              props.disabled && 'cursor-not-allowed opacity-50',
              error && 'text-error'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
