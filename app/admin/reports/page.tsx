import {
  fetchAdminBookingPipeline,
  fetchAdminReschedulePipeline,
} from "@/lib/supabase/admin/admin-repository";
import { getServerTranslator } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export default async function AdminReportsPage() {
  const { t } = await getServerTranslator();
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("onboarding_answers").select("emotions, completed_at, support_type");

  const [bookPipe, reschedulePipe] = await Promise.all([
    fetchAdminBookingPipeline(supabase).catch(() => null),
    fetchAdminReschedulePipeline(supabase).catch(() => null),
  ]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-6 text-[0.9rem] text-rose-50/95">
        {t("admin.reports.loadError")}
      </div>
    );
  }

  const list = rows ?? [];
  const completed = list.filter((r) => r.completed_at);
  const avgEmotions =
    completed.length === 0
      ? 0
      : completed.reduce((acc, r) => acc + (Array.isArray(r.emotions) ? r.emotions.length : 0), 0) / completed.length;

  const supportBreakdown = completed.reduce<Record<string, number>>((acc, r) => {
    const k = r.support_type ?? "—";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  function supportLabel(key: string) {
    if (key === "—") return "—";
    const path = `onboarding.support.${key}.label`;
    const v = t(path);
    return v === path ? key : v;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">{t("admin.reports.kicker")}</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">{t("admin.reports.title")}</h1>
        <p className="text-[0.9rem] text-muted-foreground">{t("admin.reports.introOnboarding")}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{t("admin.reports.started")}</p>
          <p className="mt-3 font-display text-3xl tabular-nums tracking-tight">{list.length}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{t("admin.reports.completed")}</p>
          <p className="mt-3 font-display text-3xl tabular-nums tracking-tight">{completed.length}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">{t("admin.reports.avgEmotions")}</p>
          <p className="mt-3 font-display text-3xl tabular-nums tracking-tight">{avgEmotions.toFixed(1)}</p>
        </div>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-6 shadow-[var(--shadow-glass)]">
        <h2 className="font-display text-lg tracking-[-0.02em]">{t("admin.reports.supportMix")}</h2>
        <ul className="mt-4 space-y-2 text-[0.88rem] text-muted-foreground">
          {Object.entries(supportBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-border/30 py-2 last:border-0">
                <span className="text-foreground/90">{supportLabel(k)}</span>
                <span className="tabular-nums">{v}</span>
              </li>
            ))}
        </ul>
      </div>

      {bookPipe && reschedulePipe ? (
        <section className="space-y-4">
          <header className="space-y-1">
            <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">
              {t("admin.reports.bookingsKicker")}
            </p>
            <h2 className="font-display text-xl tracking-[-0.02em]">{t("admin.reports.bookingsTitle")}</h2>
            <p className="text-[0.9rem] text-muted-foreground">{t("admin.reports.bookingsIntro")}</p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.totalSessions")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{bookPipe.total}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.upcomingActive")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{bookPipe.upcomingActive}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.cancellationRate")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{pct(bookPipe.cancellationRate)}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.paidShare")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{pct(bookPipe.paidShare)}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.uniqueTherapistsBooked")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{bookPipe.uniqueTherapists}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.reschedulePending")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{reschedulePipe.pending}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.rescheduleAccepted")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{reschedulePipe.accepted}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t("admin.reports.rescheduleRejected")}
              </p>
              <p className="mt-3 font-display text-2xl tabular-nums tracking-tight">{reschedulePipe.rejected}</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
