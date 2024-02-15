import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon
} from "@radix-ui/react-icons"
import * as React from "react"

import { cn } from "~lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-px-2 nf-py-1.5 nf-text-sm nf-outline-none focus:nf-bg-accent data-[state=open]:nf-bg-accent",
      inset && "nf-pl-8",
      className
    )}
    {...props}>
    {children}
    <ChevronRightIcon className="nf-ml-auto nf-h-4 nf-w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "nf-z-50 nf-min-w-[8rem] nf-overflow-hidden nf-rounded-md nf-border nf-bg-popover nf-p-1 nf-text-popover-foreground nf-shadow-lg data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0 data-[state=closed]:nf-zoom-out-95 data-[state=open]:nf-zoom-in-95 data-[side=bottom]:nf-slide-in-from-top-2 data-[side=left]:nf-slide-in-from-right-2 data-[side=right]:nf-slide-in-from-left-2 data-[side=top]:nf-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    portalProps?: DropdownMenuPrimitive.DropdownMenuPortalProps
  }
>(({ className, portalProps, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal {...portalProps}>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "nf-z-50 nf-min-w-[8rem] nf-overflow-hidden nf-rounded-md nf-border nf-bg-popover nf-p-1 nf-text-popover-foreground nf-shadow-md",
        "data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0 data-[state=closed]:nf-zoom-out-95 data-[state=open]:nf-zoom-in-95 data-[side=bottom]:nf-slide-in-from-top-2 data-[side=left]:nf-slide-in-from-right-2 data-[side=right]:nf-slide-in-from-left-2 data-[side=top]:nf-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-px-2 nf-py-1.5 nf-text-sm nf-outline-none nf-transition-colors focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      inset && "nf-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-py-1.5 nf-pl-8 nf-pr-2 nf-text-sm nf-outline-none nf-transition-colors focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="nf-absolute nf-left-2 nf-flex nf-h-3.5 nf-w-3.5 nf-items-center nf-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="nf-h-4 nf-w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-py-1.5 nf-pl-8 nf-pr-2 nf-text-sm nf-outline-none nf-transition-colors focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      className
    )}
    {...props}>
    <span className="nf-absolute nf-left-2 nf-flex nf-h-3.5 nf-w-3.5 nf-items-center nf-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="nf-h-4 nf-w-4 nf-fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "nf-px-2 nf-py-1.5 nf-text-sm nf-font-semibold",
      inset && "nf-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("nf--mx-1 nf-my-1 nf-h-px nf-bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "nf-ml-auto nf-text-xs nf-tracking-widest nf-opacity-60",
        className
      )}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
}
