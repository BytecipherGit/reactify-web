import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ length = 4, value, onChange, disabled, className }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, newValue: string) => {
      // Only allow digits
      if (newValue && !/^\d$/.test(newValue)) return

      const newOTP = value.split('')
      newOTP[index] = newValue
      const updatedOTP = newOTP.join('').slice(0, length)
      onChange(updatedOTP)

      // Auto-focus next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData('text').slice(0, length)
      if (/^\d+$/.test(pastedData)) {
        onChange(pastedData)
        const nextIndex = Math.min(pastedData.length, length - 1)
        inputRefs.current[nextIndex]?.focus()
      }
    }

    return (
      <div ref={ref} className={cn('flex gap-2 justify-center', className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 border-border',
              'bg-bg text-text',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200'
            )}
          />
        ))}
      </div>
    )
  }
)

OTPInput.displayName = 'OTPInput'
