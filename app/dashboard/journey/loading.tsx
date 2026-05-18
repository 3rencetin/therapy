export default function JourneyLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-24">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="h-12 max-w-xl animate-pulse rounded-2xl bg-white/[0.08]" />
        <div className="h-4 max-w-2xl animate-pulse rounded-md bg-white/[0.05]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-white/[0.03]" />
        <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-white/[0.03]" />
      </div>
    </div>
  );
}
