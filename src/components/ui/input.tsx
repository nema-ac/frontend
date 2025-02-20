import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-matrix-green/20 bg-matrix-black/50 px-3 py-2 text-sm",
          "ring-offset-background placeholder:text-matrix-green/50 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-matrix-light-green focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
