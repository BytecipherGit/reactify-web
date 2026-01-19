import * as React from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils/cn'
import { Button } from './button'

export interface CaptchaProps {
  value: string
  onChange: (value: string) => void
  onRefresh: () => void
  captchaText: string
  error?: string
  disabled?: boolean
}

// Generate random style for each character
const getRandomStyle = () => {
  const styles = [
    { fontStyle: 'italic' },
    { fontWeight: 'bold' },
    { textDecorationLine: 'underline' },
    { textDecorationLine: 'line-through' },
  ]
  return styles[Math.floor(Math.random() * styles.length)]
}

// Generate random character
const getRandomChar = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return chars.charAt(Math.floor(Math.random() * chars.length))
}

// Generate CAPTCHA
export const generateCaptcha = () => {
  const captcha = []
  for (let i = 0; i < 8; i++) {
    captcha.push({ char: getRandomChar(), style: getRandomStyle() })
  }
  return captcha
}

export function Captcha({
  value,
  onChange,
  onRefresh,
  captchaText,
  error,
  disabled,
}: CaptchaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text mb-1.5">
        CAPTCHA
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter CAPTCHA"
          disabled={disabled}
          className={cn(
            'flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:ring-error focus:border-error'
          )}
        />
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center gap-1 px-3 py-2 rounded-lg',
              'bg-bg-secondary border border-border min-w-[120px]',
              'font-mono text-lg'
            )}
          >
            {captchaText.split('').map((char, index) => (
              <span
                key={index}
                className="inline-block"
                style={{
                  transform: `rotate(${Math.random() * 30 - 15}deg)`,
                  ...getRandomStyle(),
                }}
              >
                {char}
              </span>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={disabled}
            className="p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
