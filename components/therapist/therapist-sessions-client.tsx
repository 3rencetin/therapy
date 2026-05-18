"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n/i18n-provider";
import { SessionReschedulePanel } from "@/components/sessions/session-reschedule-panel";
import { SessionJoinVideoControl } from "@/components/video/session-join-video-control";
import { Button } from "@/components/ui/button";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import type { RescheduleRequestRow } from "@/lib/supabase/reschedule-repository";
import type { TherapistBookingRow, TherapistPrepPage } from "@/lib/supabase/therapist-workspace-repository";

function isUpcomingActive(b: TherapistBookingRow): boolean {
  return (
    new Date(b.starts_at).getTime() >= Date.now() && (b.status === "pending" || b.status === "confirmed")
  );
}

function NotebookSummary({ pages }: { pages: TherapistPrepPage[] }) {
  const { t } = useI18n();
  if (pages.length === 0) return null;
  return (
    <details className="mt-3 rounded-lg border border-violet-400/18 bg-violet-500/[0.06] px-3 py-2">
      <summary className="cursor-pointer select-none text-[0.72rem] font-medium text-foreground/90">
        {t("therapist.sessions.notesSummary", { count: pages.length })}
      </summary>
      <ul className="mt-2 max-h-[280px] space-y-3 overflow-y-auto border-t border-border/30 pt-2">
        {pages.map((p, i) => (
          <li key={`${p.sort_order}-${i}`} className="text-[0.75rem] leading-relaxed">
            <p className="font-medium text-foreground/95">
              {p.title.trim() || t("therapist.sessions.pageN", { n: i + 1 })}
            </p>
            {p.body.trim() ? (
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{p.body}</p>
            ) : (
              <p className="mt-1 italic text-muted-foreground/80">{t("therapist.sessions.pageEmpty")}</p>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TherapistSessionsClient({
  profileId,
  therapistUserId,
  upcoming,
  other,
  pendingBySessionId,
}: {
  profileId: string;
  therapistUserId: string;
  upcoming: TherapistBookingRow[];
  other: TherapistBookingRow[];
  pendingBySessionId: Record<string, RescheduleRequestRow | undefined>;
}) {
  const { t, locale } = useI18n();

  function lifecycleLabel(status: string) {
    const path = `booking.lifecycleLong.${status}` as const;
    const v = t(path);
    return v === path ? status : v;
  }

  function paymentLabel(ps: string) {
    const path = `booking.paymentLong.${ps}` as const;
    const v = t(path);
    return v === path ? ps : v;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">
            {t("therapist.sessions.calendar")}
          </p>
          <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">{t("therapist.sessions.title")}</h1>
        </div>
        <Button asChild variant="outline" className="self-start rounded-xl sm:self-auto">
          <Link href="/therapist/availability">{t("therapist.sessions.editAvailability")}</Link>
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("therapist.sessions.upcoming")}
        </h2>
        <ul className="space-y-2">
          {upcoming.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/50 px-4 py-10 text-center text-[0.88rem] text-muted-foreground">
              {t("therapist.sessions.noUpcoming")}
            </li>
          ) : (
            upcoming.map((b) => {
              const headline =
                b.client?.full_name?.trim() || b.client?.email?.trim() || t("common.therapistFallback");
              const email = b.client?.email?.trim() ?? "";
              const pending = pendingBySessionId[b.id] ?? null;
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/45 bg-white/[0.02] px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-[0.95rem] font-medium text-foreground">{headline}</p>
                      {email && email !== headline ? (
                        <p className="text-[0.8rem] text-muted-foreground">{email}</p>
                      ) : null}
                      {b.notes?.trim() ? (
                        <p className="mt-2 text-[0.78rem] leading-relaxed text-muted-foreground/95">
                          {b.notes.trim()}
                        </p>
                      ) : null}
                      <NotebookSummary pages={b.prep_pages} />
                      <SessionReschedulePanel
                        sessionId={b.id}
                        profileId={profileId}
                        viewerUserId={therapistUserId}
                        viewerRole="therapist"
                        pending={pending}
                        allowPropose={
                          (b.status === "pending" || b.status === "confirmed") &&
                          isUpcomingActive(b) &&
                          !pendingBySessionId[b.id]
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg border border-border/40 bg-white/[0.02] px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                        {lifecycleLabel(b.status)}
                      </span>
                      <span className="rounded-lg border border-border/40 bg-white/[0.02] px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                        {paymentLabel(b.payment_status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SessionJoinVideoControl
                        sessionId={b.id}
                        startsAt={b.starts_at}
                        endsAt={b.ends_at}
                        status={b.status}
                        videoExtendedUntil={b.video_call_extended_until}
                        callHref={`/therapist/sessions/${b.id}/call`}
                      />
                      <Button asChild variant="outline" size="sm" className="w-fit rounded-xl">
                        <Link href={`/therapist/sessions/${b.id}/prep`}>{t("therapist.sessions.prepLink")}</Link>
                      </Button>
                    </div>
                  </div>
                  <p className="shrink-0 text-[0.88rem] text-muted-foreground sm:max-w-[220px] sm:text-right">
                    {formatIstanbulSessionWindow(b.starts_at, b.ends_at, locale)}
                  </p>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("therapist.sessions.past")}
        </h2>
        <ul className="space-y-2">
          {other.length === 0 ? (
            <li className="text-[0.85rem] text-muted-foreground">{t("therapist.sessions.noRecords")}</li>
          ) : (
            other.map((b) => {
              const headline =
                b.client?.full_name?.trim() || b.client?.email?.trim() || t("common.therapistFallback");
              const email = b.client?.email?.trim() ?? "";
              return (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/35 bg-white/[0.015] px-3 py-3 text-[0.8rem] sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-foreground/95">{headline}</p>
                    {email && email !== headline ? (
                      <p className="text-[0.75rem] text-muted-foreground">{email}</p>
                    ) : null}
                    <p className="text-[0.68rem] text-muted-foreground">
                      {lifecycleLabel(b.status)} · {paymentLabel(b.payment_status)}
                    </p>
                    {b.notes?.trim() ? (
                      <p className="text-[0.72rem] leading-relaxed text-muted-foreground/90">{b.notes.trim()}</p>
                    ) : null}
                    <NotebookSummary pages={b.prep_pages} />
                  </div>
                  <span className="shrink-0 text-[0.78rem] text-muted-foreground sm:text-right">
                    {formatIstanbulSessionWindow(b.starts_at, b.ends_at, locale)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
