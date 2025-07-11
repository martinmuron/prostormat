import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-800 focus-visible:ring-gray-400",
        secondary: "border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 bg-white focus-visible:ring-gray-500",
        ghost: "text-gray-900 hover:bg-gray-100 hover:text-black focus-visible:ring-gray-500",
        link: "text-gray-900 underline-offset-4 hover:underline hover:text-black focus-visible:ring-gray-500",
      },
      size: {
        default: "px-8 py-3",
        sm: "px-6 py-2 text-callout",
        lg: "px-10 py-4 text-headline",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }