import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-caption font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-black text-white focus:ring-gray-400",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-black",
        outline: "border border-gray-200 text-gray-700 focus:ring-black",
        success: "bg-green-100 text-green-800 focus:ring-green-400",
        warning: "bg-yellow-100 text-yellow-800 focus:ring-yellow-400",
        error: "bg-red-100 text-red-800 focus:ring-red-400",
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