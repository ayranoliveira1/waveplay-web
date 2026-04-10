import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variantStyles = {
  primary: 'bg-primary hover:bg-primary-light text-text',
  secondary: 'bg-surface hover:bg-border text-text',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
} as const

export function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`h-12 px-5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}
