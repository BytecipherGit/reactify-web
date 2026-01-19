import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, children, ...props }, ref) => {
    const variants = {
      success: 'bg-success-light border-success text-success',
      error: 'bg-error-light border-error text-error',
      warning: 'bg-warning-light border-warning text-warning',
      info: 'bg-info-light border-info text-info',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {title && (
          <h4 className="mb-1 font-semibold">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'
