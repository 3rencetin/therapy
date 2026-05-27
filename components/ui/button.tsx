import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-[-0.01em] transition-[transform,box-shadow,background-color,color,opacity] duration-300 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-premium)] hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-ring/50",
        outline:
          "border border-border bg-card/80 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40",
        ghost: "bg-transparent text-foreground hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-ring/35",
        subtle:
          "bg-muted text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-card focus-visible:ring-2 focus-visible:ring-ring/35",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
