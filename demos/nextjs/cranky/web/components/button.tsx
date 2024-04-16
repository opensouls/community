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
    return <Comp className={cn("px-4 bg-c-green text-white shadow-blocky", className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
