import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-nema-dusk/50 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',

          // Variants
          variant === 'default' && [
            'bg-nema-dusk text-white shadow-md',
            'hover:bg-nema-dusk/90 hover:shadow-lg',
            'font-semibold',
          ],
          variant === 'outline' && [
            'border-2 border-nema-dusk/30',
            'text-nema-dusk font-semibold',
            'hover:bg-nema-dusk/10',
          ],

          // Sizes
          size === 'default' && 'px-6 py-3',
          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-8 py-4 text-lg',

          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
