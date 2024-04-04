import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  small?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, small = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "h-14 text-lg text-primary px-4 font-medium bg-white border-primary border-4 shadow-[0px_4px_0px_#000] rounded-2xl",
          "transition-transform",
          "disabled:border-[#00000060] disabled:shadow-[0px_4px_0px_#00000060] disabled:text-[#00000060] disabled:mt-0",
          "[&:not(:disabled):hover]:scale-110 [&:not(:disabled):hover]:rotate-6",
          "[&:not(:disabled):focus]:scale-110 [&:not(:disabled):focus]:rotate-6 focus-visible:outline-none",
          "[&:not(:disabled):active]:shadow-none [&:not(:disabled):active]:mt-1 [&:not(:disabled):active]:-mb-1",
          small ? "h-10 text-sm" : "",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
