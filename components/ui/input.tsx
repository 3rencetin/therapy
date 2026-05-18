import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-border/70 bg-input px-3.5 text-[0.9375rem] text-foreground shadow-[0_1px_0_oklch(1_0_0/0.03)_inset] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground/75 focus-visible:border-border focus-visible:bg-white/[0.045] focus-visible:ring-2 focus-visible:ring-ring/55 disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
