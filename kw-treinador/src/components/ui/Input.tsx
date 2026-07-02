import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wide text-white/50"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-graphite-100 bg-graphite-300 px-4 text-sm text-white placeholder:text-white/30',
          'transition-colors focus:border-gold focus:outline-none',
          className
        )}
        {...props}
      />
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
