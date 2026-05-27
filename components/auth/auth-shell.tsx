import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,color-mix(in_srgb,var(--apple-blue)_20%,transparent),transparent_55%),radial-gradient(ellipse_70%_45%_at_100%_100%,color-mix(in_srgb,var(--apple-indigo)_16%,transparent),transparent_50%)]"
      />
      <div className="ambient-grid pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden />
      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1380px] lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)] lg:items-stretch">
        {children}
      </div>
    </div>
  );
}
