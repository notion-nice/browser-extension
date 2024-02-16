import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "nf-fixed nf-top-0 nf-z-[100] nf-flex nf-max-h-screen nf-w-full nf-flex-col-reverse nf-p-4 sm:nf-bottom-0 sm:nf-right-0 sm:nf-top-auto sm:nf-flex-col md:nf-max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "nf-group nf-pointer-events-auto nf-relative nf-flex nf-w-full nf-items-center nf-justify-between nf-space-x-2 nf-overflow-hidden nf-rounded-md nf-border nf-p-4 nf-pr-6 nf-shadow-lg nf-transition-all data-[swipe=cancel]:nf-translate-x-0 data-[swipe=end]:nf-translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:nf-translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:nf-transition-none data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[swipe=end]:nf-animate-out data-[state=closed]:nf-fade-out-80 data-[state=closed]:nf-slide-out-to-right-full data-[state=open]:nf-slide-in-from-top-full data-[state=open]:sm:nf-slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "nf-border nf-bg-background nf-text-foreground",
        destructive:
          "nf-destructive nf-group nf-border-destructive nf-bg-destructive nf-text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "nf-inline-flex nf-h-8 nf-shrink-0 nf-items-center nf-justify-center nf-rounded-md nf-border nf-bg-transparent nf-px-3 nf-text-sm nf-font-medium nf-transition-colors hover:nf-bg-secondary focus:nf-outline-none focus:nf-ring-1 focus:nf-ring-ring disabled:nf-pointer-events-none disabled:nf-opacity-50 group-[.destructive]:nf-border-muted/40 group-[.destructive]:hover:nf-border-destructive/30 group-[.destructive]:hover:nf-bg-destructive group-[.destructive]:hover:nf-text-destructive-foreground group-[.destructive]:focus:nf-ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "nf-absolute nf-right-1 nf-top-1 nf-rounded-md nf-p-1 nf-text-foreground/50 nf-opacity-0 nf-transition-opacity hover:nf-text-foreground focus:nf-opacity-100 focus:nf-outline-none focus:nf-ring-1 group-hover:nf-opacity-100 group-[.destructive]:nf-text-red-300 group-[.destructive]:hover:nf-text-red-50 group-[.destructive]:focus:nf-ring-red-400 group-[.destructive]:focus:nf-ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="nf-h-4 nf-w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("nf-text-sm nf-font-semibold [&+div]:nf-text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("nf-text-sm nf-opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
