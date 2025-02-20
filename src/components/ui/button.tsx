import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matrix-light-green focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variant styles
          variant === 'default' && "bg-matrix-green text-black hover:bg-matrix-light-green",
          variant === 'outline' && "border border-matrix-green bg-transparent hover:bg-matrix-green/10 text-matrix-green",

          // Size styles
          size === 'default' && "h-10 px-4 py-2",
          size === 'sm' && "h-9 rounded-md px-3",
          size === 'lg' && "h-11 rounded-md px-8",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
