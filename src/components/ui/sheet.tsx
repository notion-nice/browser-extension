import * as SheetPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "~lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "nf-fixed nf-inset-0 nf-z-50 nf-bg-black/80 nf- data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "nf-fixed nf-z-50 nf-gap-4 nf-bg-background nf-p-6 nf-shadow-lg nf-transition nf-ease-in-out data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-duration-300 data-[state=open]:nf-duration-500",
  {
    variants: {
      side: {
        top: "nf-inset-x-0 nf-top-0 nf-border-b data-[state=closed]:nf-slide-out-to-top data-[state=open]:nf-slide-in-from-top",
        bottom:
          "nf-inset-x-0 nf-bottom-0 nf-border-t data-[state=closed]:nf-slide-out-to-bottom data-[state=open]:nf-slide-in-from-bottom",
        left: "nf-inset-y-0 nf-left-0 nf-h-full nf-w-3/4 nf-border-r data-[state=closed]:nf-slide-out-to-left data-[state=open]:nf-slide-in-from-left sm:nf-max-w-sm",
        right:
          "nf-inset-y-0 nf-right-0 nf-h-full nf-w-3/4 nf-border-l data-[state=closed]:nf-slide-out-to-right data-[state=open]:nf-slide-in-from-right sm:nf-max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
)

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  portalProps?: SheetPrimitive.DialogPortalProps
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, portalProps, ...props }, ref) => (
  <SheetPortal {...portalProps}>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}>
      {children}
      <SheetPrimitive.Close className="nf-absolute nf-right-4 nf-top-4 nf-rounded-sm nf-opacity-70 nf-ring-offset-background nf-transition-opacity hover:nf-opacity-100 focus:nf-outline-none focus:nf-ring-2 focus:nf-ring-ring focus:nf-ring-offset-2 disabled:nf-pointer-events-none data-[state=open]:nf-bg-secondary">
        <Cross2Icon className="nf-h-4 nf-w-4" />
        <span className="nf-sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "nf-flex nf-flex-col nf-space-y-2 nf-text-center sm:nf-text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "nf-flex nf-flex-col-reverse sm:nf-flex-row sm:nf-justify-end sm:nf-space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("nf-text-lg nf-font-semibold nf-text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("nf-text-sm nf-text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
}
