import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

export interface StatusMessageProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  gradient?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  children?: React.ReactNode
}

export const StatusMessage = React.forwardRef<HTMLDivElement, StatusMessageProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ type = 'info', message, gradient, dismissible, onDismiss, children, className, ...props }, ref) => {
    const baseStyles = 'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200'
    
    const typeStyles = {
      success: gradient
        ? 'border-success bg-success-light text-success'
        : 'border-success bg-success-light text-success',
      error: gradient
        ? 'border-error bg-error-light text-error'
        : 'border-error bg-error-light text-error',
      warning: gradient
        ? 'border-warning bg-warning-light text-warning'
        : 'border-warning bg-warning-light text-warning',
      info: gradient
        ? 'border-info bg-info-light text-info'
        : 'border-info bg-info-light text-info',
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, typeStyles[type], className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p>{message}</p>
            {children}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-text-muted hover:text-text transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

StatusMessage.displayName = 'StatusMessage'
