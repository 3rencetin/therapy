"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CalendarClock, Clock3, Shield, Sparkles, BookMarked } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import type { BookedSessionListRow } from "@/lib/supabase/booking-repository";
import type { RescheduleRequestRow } from "@/lib/supabase/reschedule-repository";
import { Button } from "@/components/ui/button";
import { cancelTherapistSessionAction } from "@/lib/actions/therapist-booking-actions";
import { fadeUp, onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import { cn } from "@/lib/utils";

import { SessionReschedulePanel } from "./session-reschedule-panel";

function isUpcomingActive(row: BookedSessionListRow): boolean {
  if (row.status !== "pending" && row.status !== "confirmed") return false;
  return new Date(row.starts_at).getTime() >= Date.now();
}

export function SessionsHub({
  bookings,
  pendingBySessionId,
  viewerUserId,
}: {
  bookings: BookedSessionListRow[];
  pendingBySessionId: Record<string, RescheduleRequestRow | undefined>;
  viewerUserId: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { upcoming, archive } = useMemo(() => {
    const up: BookedSessionListRow[] = [];
    const rest: BookedSessionListRow[] = [];
    for (const row of bookings) {
      if (isUpcomingActive(row)) up.push(row);
      else rest.push(row);
    }
    up.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    rest.sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
    return { upcoming: up, archive: rest };
  }, [bookings]);

  async function cancel(id: string) {
    setMessage(null);
    setPendingId(id);
    startTransition(async () => {
      const res = await cancelTherapistSessionAction(id);
      setPendingId(null);
      if (!res.ok) {
        setMessage(res.message);
        return;
      }
      setMessage(t("sessions.hub.cancelOk"));
      router.refresh();
    });
  }

  function lifecycleLabel(status: string) {
    const path = `booking.lifecycle.${status}` as const;
    const v = t(path);
    return v === path ? status : v;
  }

  function paymentBadge(paymentStatus: string) {
    const path = `booking.payment.${paymentStatus}` as const;
    const v = t(path);
    return v === path ? paymentStatus : v;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12 pb-20">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="space-y-3">
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">{t("sessions.hub.kicker")}</p>
        <h1 className="font-display text-[2rem] tracking-[-0.03em] sm:text-[2.25rem]">{t("sessions.hub.title")}</h1>
        <p className="max-w-xl text-[0.92rem] leading-relaxed text-muted-foreground">{t("sessions.hub.intro")}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/therapists">{t("sessions.hub.discover")}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/journey">{t("sessions.hub.journey")}</Link>
          </Button>
        </div>
      </motion.header>

      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/18 bg-emerald-500/[0.07] px-4 py-3 text-[0.86rem] text-emerald-50/95"
        >
          {message}
        </motion.div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          <CalendarClock className="size-4" />
          {t("sessions.hub.upcoming")}
        </div>
        {upcoming.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-dashed border-border/55 bg-white/[0.02] px-6 py-14 text-center">
            <p className="font-display text-lg text-foreground">{t("sessions.hub.emptyTitle")}</p>
            <p className="mx-auto mt-2 max-w-md text-[0.9rem] leading-relaxed text-muted-foreground">
              {t("sessions.hub.emptyBody")}
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link href="/dashboard/therapists">{t("sessions.hub.explore")}</Link>
            </Button>
          </div>
        ) : (
          <motion.ul variants={onboardingListContainer} initial="initial" animate="animate" className="space-y-3">
            {upcoming.map((row) => (
              <motion.li
                key={row.id}
                variants={onboardingListItem}
                className="rounded-[var(--radius-xl)] border border-border/55 bg-white/[0.025] p-5 shadow-[var(--shadow-glass)] backdrop-blur-[14px]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-display text-[1.15rem] tracking-[-0.015em]">
                      {row.therapist_profiles?.full_name ?? t("common.therapistFallback")}
                    </p>
                    <p className="text-[0.82rem] text-muted-foreground">
                      {row.therapist_profiles?.professional_title?.trim() ?? t("common.professionalSupport")}
                    </p>
                    <p className="inline-flex items-center gap-2 pt-2 text-[0.86rem] text-foreground/90">
                      <Clock3 className="size-4 text-muted-foreground" />
                      {formatIstanbulSessionWindow(row.starts_at, row.ends_at, locale)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="rounded-full border border-border/50 bg-white/[0.03] px-2.5 py-0.5 text-[0.68rem] text-muted-foreground">
                        {lifecycleLabel(row.status)}
                      </span>
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-0.5 text-[0.68rem] text-amber-100/90">
                        {t("booking.paymentPrefix")} {paymentBadge(row.payment_status)}
                      </span>
                      {row.therapist_profiles?.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-emerald-100/90 uppercase">
                          <Shield className="size-3" />
                          {t("sessions.hub.verified")}
                        </span>
                      ) : null}
                    </div>
                    <SessionReschedulePanel
                      sessionId={row.id}
                      profileId={row.profile_id}
                      viewerUserId={viewerUserId}
                      viewerRole="user"
                      pending={pendingBySessionId[row.id] ?? null}
                      allowPropose={
                        (row.status === "pending" || row.status === "confirmed") &&
                        isUpcomingActive(row) &&
                        !pendingBySessionId[row.id]
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href={`/dashboard/sessions/${row.id}/notebook`}>
                        <BookMarked className="mr-1.5 size-4" />
                        {t("sessions.hub.notebook")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href={`/dashboard/therapists/${row.profile_id}`}>{t("sessions.hub.viewProfile")}</Link>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-rose-100/90 hover:bg-rose-500/[0.08] hover:text-rose-50"
                      disabled={isPending && pendingId === row.id}
                      onClick={() => cancel(row.id)}
                    >
                      {isPending && pendingId === row.id
                        ? t("sessions.hub.cancelling")
                        : t("sessions.hub.cancelSession")}
                    </Button>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>

      {archive.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <Sparkles className="size-4" />
            {t("sessions.hub.past")}
          </div>
          <ul className="space-y-2">
            {archive.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border border-border/40 bg-white/[0.015] px-4 py-3 text-[0.82rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
                )}
              >
                <span className="text-foreground/90">
                  {row.therapist_profiles?.full_name ?? t("common.therapistFallback")}
                </span>
                <span>{formatIstanbulSessionWindow(row.starts_at, row.ends_at, locale)}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-[0.72rem]">
                    <Link href={`/dashboard/sessions/${row.id}/notebook`}>
                      <BookMarked className="mr-1 size-3.5" />
                      {t("sessions.hub.notes")}
                    </Link>
                  </Button>
                  <span className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground/80">
                    {row.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
