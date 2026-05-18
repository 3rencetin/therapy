export default function SessionsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-20">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/[0.08]" />
        <div className="h-4 max-w-lg animate-pulse rounded-md bg-white/[0.05]" />
      </div>
      <div className="h-40 animate-pulse rounded-[var(--radius-xl)] border border-border/40 bg-white/[0.03]" />
      <div className="h-40 animate-pulse rounded-[var(--radius-xl)] border border-border/40 bg-white/[0.03]" />
    </div>
  );
}
