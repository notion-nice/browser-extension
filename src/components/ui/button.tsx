import { ReloadIcon } from "@radix-ui/react-icons"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "~lib/utils"

const buttonVariants = cva(
  "nf-inline-flex nf-items-center nf-justify-center nf-whitespace-nowrap nf-rounded-md nf-text-sm nf-font-medium nf-transition-colors focus-visible:nf-outline-none focus-visible:nf-ring-1 focus-visible:nf-ring-ring disabled:nf-pointer-events-none disabled:nf-cursor-not-allowed disabled:nf-bg-tertiary disabled:nf-text-tertiary-foreground disabled:nf-opacity-50",
  {
    variants: {
      variant: {
        default:
          "nf-bg-primary nf-text-primary-foreground nf-shadow hover:nf-bg-primary/90",
        destructive:
          "nf-bg-destructive nf-text-destructive-foreground nf-shadow-sm hover:nf-bg-destructive/90",
        outline:
          "nf-border nf-border-input nf-bg-background nf-shadow-sm hover:nf-bg-accent hover:nf-text-accent-foreground",
        secondary:
          "nf-bg-secondary nf-text-secondary-foreground nf-shadow-sm hover:nf-bg-secondary/80",
        ghost: "hover:nf-bg-accent hover:nf-text-accent-foreground",
        link: "nf-text-primary nf-underline-offset-4 hover:nf-underline",
        marked: "nf-text-red nf-underline-offset-4 hover:nf-underline"
      },
      size: {
        default: "nf-h-9 nf-px-4 nf-py-2",
        sm: "nf-h-8 nf-rounded-md nf-px-3 nf-text-xs",
        lg: "nf-h-10 nf-rounded-md nf-px-8",
        icon: "nf-h-9 nf-w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={loading ? true : props.disabled}>
        {loading && <ReloadIcon className="nf-mr-2 nf-h-4 nf-w-4 nf-animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
