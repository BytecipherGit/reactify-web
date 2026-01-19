import * as React from 'react'
import { cn } from '../../lib/utils/cn'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-24 w-24 text-2xl',
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', fallback, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)
    const displayName = name || alt || 'User'
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const handleImageError = () => {
      setImgError(true)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-bg-secondary text-text-secondary font-medium overflow-hidden',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt || displayName}
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <span className="flex items-center justify-center h-full w-full">
            {fallback || initials}
          </span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'
