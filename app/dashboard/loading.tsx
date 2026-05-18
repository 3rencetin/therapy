export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-10 pb-16" style={{ animationDuration: "1.4s" }}>
      <div className="h-48 rounded-[var(--radius-xl)] border border-border/40 bg-white/[0.04]" />
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-md bg-white/[0.06]" />
          <div className="h-40 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
          <div className="h-40 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
          <div className="h-48 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
        </div>
      </div>
      <div className="h-56 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
      <div className="h-32 rounded-[var(--radius-xl)] border border-border/35 bg-white/[0.03]" />
    </div>
  );
}
