import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-body focus:border-black focus:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 hover:shadow-lg appearance-none cursor-pointer font-medium shadow-sm",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }