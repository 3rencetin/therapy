import { cn } from "@/lib/utils";

export function TherapistsDiscoverySkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="h-10 max-w-lg animate-pulse rounded-xl bg-white/[0.07]" />
        <div className="h-4 max-w-xl animate-pulse rounded-md bg-white/[0.05]" />
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-4">
        <div className="h-11 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-white/[0.05]" />
          ))}
        </div>
      </div>
      <div
        className={cn(
          "grid gap-4",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[17.5rem] animate-pulse rounded-[var(--radius-xl)] border border-border/40 bg-white/[0.03]"
          />
        ))}
      </div>
    </div>
  );
}
