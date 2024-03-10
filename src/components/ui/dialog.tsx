import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as React from "react"

import { cn } from "~lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "nf-fixed nf-inset-0 nf-z-50 nf-bg-black/80 nf- data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  portalProps?: DialogPrimitive.DialogPortalProps
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, portalProps, ...props }, ref) => (
  <DialogPortal {...portalProps}>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "nf-fixed nf-left-[50%] nf-top-[50%] nf-z-50 nf-grid nf-w-full nf-max-w-lg nf-translate-x-[-50%] nf-translate-y-[-50%] nf-gap-4 nf-border nf-bg-background nf-p-6 nf-shadow-lg nf-duration-200 data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0 data-[state=closed]:nf-zoom-out-95 data-[state=open]:nf-zoom-in-95 data-[state=closed]:nf-slide-out-to-left-1/2 data-[state=closed]:nf-slide-out-to-top-[48%] data-[state=open]:nf-slide-in-from-left-1/2 data-[state=open]:nf-slide-in-from-top-[48%] sm:nf-rounded-lg",
        className
      )}
      {...props}>
      {children}
      <DialogPrimitive.Close className="nf-absolute nf-right-4 nf-top-4 nf-rounded-sm nf-opacity-70 nf-ring-offset-background nf-transition-opacity hover:nf-opacity-100 focus:nf-outline-none focus:nf-ring-2 focus:nf-ring-ring focus:nf-ring-offset-2 disabled:nf-pointer-events-none data-[state=open]:nf-bg-accent data-[state=open]:nf-text-muted-foreground">
        <Cross2Icon className="nf-h-4 nf-w-4" />
        <span className="nf-sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "nf-flex nf-flex-col nf-space-y-1.5 nf-text-center sm:nf-text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "nf-text-lg nf-font-semibold nf-leading-none nf-tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("nf-text-sm nf-text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
