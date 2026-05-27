import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-input px-3.5 text-[0.9375rem] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-muted-foreground focus-visible:border-[#007AFF66] focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-[#007AFF22] disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
