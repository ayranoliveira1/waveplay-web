import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="mb-5">
        {label && (
          <label className="block text-sm font-medium text-text-muted mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`block h-12 w-full rounded-lg border bg-surface px-3 text-text text-sm outline-none transition-colors placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary ${
              error ? 'border-error' : 'border-border'
            } ${icon ? 'pl-10' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
