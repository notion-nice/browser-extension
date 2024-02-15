import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "~lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "nf-peer nf-inline-flex nf-h-5 nf-w-9 nf-shrink-0 nf-cursor-pointer nf-items-center nf-rounded-full nf-border-2 nf-border-transparent nf-shadow-sm nf-transition-colors focus-visible:nf-outline-none focus-visible:nf-ring-2 focus-visible:nf-ring-ring focus-visible:nf-ring-offset-2 focus-visible:nf-ring-offset-background disabled:nf-cursor-not-allowed disabled:nf-opacity-50 data-[state=checked]:nf-bg-primary data-[state=unchecked]:nf-bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "nf-pointer-events-none nf-block nf-h-4 nf-w-4 nf-rounded-full nf-bg-background nf-shadow-lg nf-ring-0 nf-transition-transform data-[state=checked]:nf-translate-x-4 data-[state=unchecked]:nf-translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
