import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FieldHint({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn("text-[0.75rem] leading-relaxed text-muted-foreground/85", className)}>{children}</p>
  );
}
