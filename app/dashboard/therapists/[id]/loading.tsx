export default function TherapistDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="h-[14rem] animate-pulse rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.03]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-border/40 bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-[var(--radius-xl)] border border-border/40 bg-white/[0.03]" />
    </div>
  );
}
