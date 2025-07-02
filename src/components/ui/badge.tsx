import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-black text-white hover:bg-gray-900",
        secondary: "border-transparent bg-gray-100 text-black hover:bg-gray-200",
        outline: "border-gray-300 text-black hover:bg-gray-50",
        success: "border-transparent bg-gray-800 text-white hover:bg-gray-900",
        warning: "border-transparent bg-gray-600 text-white hover:bg-gray-700",
        error: "border-transparent bg-gray-900 text-white hover:bg-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }