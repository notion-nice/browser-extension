import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon
} from "@radix-ui/react-icons"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import * as React from "react"

import { cn } from "~lib/utils"

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "nf-flex nf-h-9 nf-items-center nf-space-x-1 nf-border-b nf-bg-background nf-p-1 nf-shadow-sm",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-px-3 nf-py-1 nf-text-sm nf-font-medium nf-outline-none focus:nf-bg-accent focus:nf-text-accent-foreground data-[state=open]:nf-bg-accent data-[state=open]:nf-text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-px-2 nf-py-1.5 nf-text-sm nf-outline-none focus:nf-bg-accent focus:nf-text-accent-foreground data-[state=open]:nf-bg-accent data-[state=open]:nf-text-accent-foreground",
      inset && "nf-pl-8",
      className
    )}
    {...props}>
    {children}
    <ChevronRightIcon className="nf-ml-auto nf-h-4 nf-w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "nf-z-50 nf-min-w-[8rem] nf-overflow-hidden nf-rounded-md nf-border nf-bg-popover nf-p-1 nf-text-popover-foreground nf-shadow-lg data-[state=open]:nf-animate-in data-[state=closed]:nf-animate-out data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0 data-[state=closed]:nf-zoom-out-95 data-[state=open]:nf-zoom-in-95 data-[side=bottom]:nf-slide-in-from-top-2 data-[side=left]:nf-slide-in-from-right-2 data-[side=right]:nf-slide-in-from-left-2 data-[side=top]:nf-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> & {
    portalProps?: MenubarPrimitive.MenubarPortalProps
  }
>(
  (
    {
      className,
      align = "start",
      alignOffset = -4,
      sideOffset = 8,
      portalProps,
      ...props
    },
    ref
  ) => (
    <MenubarPrimitive.Portal {...portalProps}>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "nf-z-50 nf-min-w-[12rem] nf-overflow-hidden nf-rounded-md nf-border nf-bg-popover nf-p-1 nf-text-popover-foreground nf-shadow-md data-[state=open]:nf-animate-in data-[state=closed]:nf-fade-out-0 data-[state=open]:nf-fade-in-0 data-[state=closed]:nf-zoom-out-95 data-[state=open]:nf-zoom-in-95 data-[side=bottom]:nf-slide-in-from-top-2 data-[side=left]:nf-slide-in-from-right-2 data-[side=right]:nf-slide-in-from-left-2 data-[side=top]:nf-slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-px-2 nf-py-1.5 nf-text-sm nf-outline-none focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      inset && "nf-pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-py-1.5 nf-pl-8 nf-pr-2 nf-text-sm nf-outline-none focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      className
    )}
    checked={checked}
    {...props}>
    <span className="nf-absolute nf-left-2 nf-flex nf-h-3.5 nf-w-3.5 nf-items-center nf-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon className="nf-h-4 nf-w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "nf-relative nf-flex nf-cursor-default nf-select-none nf-items-center nf-rounded-sm nf-py-1.5 nf-pl-8 nf-pr-2 nf-text-sm nf-outline-none focus:nf-bg-accent focus:nf-text-accent-foreground data-[disabled]:nf-pointer-events-none data-[disabled]:nf-opacity-50",
      className
    )}
    {...props}>
    <span className="nf-absolute nf-left-2 nf-flex nf-h-3.5 nf-w-3.5 nf-items-center nf-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <DotFilledIcon className="nf-h-4 nf-w-4 nf-fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "nf-px-2 nf-py-1.5 nf-text-sm nf-font-semibold",
      inset && "nf-pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("nf--mx-1 nf-my-1 nf-h-px nf-bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "nf-ml-auto nf-text-xs nf-tracking-widest nf-text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut
}
