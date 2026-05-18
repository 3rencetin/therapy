import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import { getServerTranslator } from "@/lib/i18n/server";
import { fetchAdminOverview, fetchAdminRecentSessions } from "@/lib/supabase/admin/admin-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)] backdrop-blur-[14px]",
      )}
    >
      <p className="text-[0.65rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 font-display text-[2rem] tracking-[-0.03em] tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-[0.78rem] text-muted-foreground/85">{hint}</p> : null}
    </div>
  );
}

export default async function AdminHomePage() {
  const { t, locale } = await getServerTranslator();
  const supabase = await createSupabaseServerClient();
  const [stats, recent] = await Promise.all([
    fetchAdminOverview(supabase),
    fetchAdminRecentSessions(supabase, 12),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">{t("admin.home.kicker")}</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em] sm:text-[2.1rem]">{t("admin.home.title")}</h1>
        <p className="max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground">{t("admin.home.intro")}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label={t("admin.home.users")} value={stats.userCount} hint={t("admin.home.usersHint")} />
        <Metric
          label={t("admin.home.therapistDir")}
          value={stats.therapistDirectoryCount}
          hint={t("admin.home.therapistDirHint")}
        />
        <Metric
          label={t("admin.home.verified")}
          value={stats.verifiedTherapistCount}
          hint={t("admin.home.verifiedHint")}
        />
        <Metric label={t("admin.home.sessions")} value={stats.sessionCount} hint={t("admin.home.sessionsHint")} />
        <Metric
          label={t("admin.home.onboardingDone")}
          value={stats.onboardingCompletedCount}
          hint={t("admin.home.onboardingDoneHint")}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {t("admin.home.activityKicker")}
            </p>
            <h2 className="mt-1 font-display text-xl tracking-[-0.02em]">{t("admin.home.activityTitle")}</h2>
          </div>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] shadow-[var(--shadow-glass)]">
          <ul className="divide-y divide-border/40">
            {recent.length === 0 ? (
              <li className="px-5 py-12 text-center text-[0.9rem] text-muted-foreground">{t("admin.home.empty")}</li>
            ) : (
              recent.map((row) => (
                <li key={row.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[0.88rem] text-foreground">
                      {row.therapist_profiles?.full_name ?? t("common.therapistFallback")}
                    </p>
                    <p className="text-[0.72rem] text-muted-foreground">
                      {t("admin.home.customer")}{" "}
                      <span className="font-mono text-[0.68rem]">{row.user_id.slice(0, 8)}…</span>
                    </p>
                  </div>
                  <div className="text-right text-[0.8rem] text-muted-foreground">
                    <p>{formatIstanbulSessionWindow(row.starts_at, row.ends_at, locale)}</p>
                    <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground/80">{row.status}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
