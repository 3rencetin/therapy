"use client";

import type { ReactNode } from "react";

import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthField({
  id,
  label,
  icon,
  hint,
  labelAction,
  className,
  inputClassName,
  required,
  ...inputProps
}: InputProps & {
  label: string;
  icon?: ReactNode;
  hint?: ReactNode;
  labelAction?: ReactNode;
  inputClassName?: string;
}) {
  const isRequired = Boolean(required);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-[0.8125rem] font-medium text-foreground/90">
          {label}
          {isRequired ? (
            <span className="ml-0.5 text-[#FF3B30]" aria-hidden>
              *
            </span>
          ) : null}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground/75">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          required={isRequired}
          aria-required={isRequired}
          className={cn(icon && "pl-10", inputClassName)}
          {...inputProps}
        />
      </div>
      {hint}
    </div>
  );
}
