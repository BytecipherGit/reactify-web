import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  showPasswordToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, showPasswordToggle, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && showPasswordToggle && showPassword ? 'text' : type

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
        <input
            type={inputType}
          id={inputId}
          className={cn(
            'flex w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
              isPassword && showPasswordToggle && 'pr-10',
            error && 'border-error focus:ring-error focus:border-error',
            className
          )}
          ref={ref}
          {...props}
        />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
