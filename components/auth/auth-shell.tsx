import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="relative mx-auto min-h-dvh max-w-[1280px] lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch">
        {children}
      </div>
    </div>
  );
}
