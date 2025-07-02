import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-body placeholder:text-gray-400 focus:border-black focus:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 hover:shadow-lg font-medium shadow-sm focus-ring",
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