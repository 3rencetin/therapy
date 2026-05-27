"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, ChevronRight, Compass, Sparkles, Video } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import type { BookedSessionListRow } from "@/lib/supabase/booking-repository";
import { getVideoJoinPhase } from "@/lib/video/join-window";
import { cn } from "@/lib/utils";

function OverviewCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      className={cn("surface-premium overflow-hidden rounded-[var(--radius-xl)]", className)}
    >
      {children}
    </motion.section>
  );
}

export function DashboardOverviewSection({
  nextSession,
  upcomingSessionCount,
  onboardingCompleted,
}: {
  nextSession: BookedSessionListRow | null;
  upcomingSessionCount: number;
  onboardingCompleted: boolean;
}) {
  const { t, locale } = useI18n();

  if (nextSession) {
    const therapistName =
      nextSession.therapist_profiles?.full_name?.trim() || t("common.therapistFallback");
    const joinPhase = getVideoJoinPhase(
      nextSession.starts_at,
      nextSession.ends_at,
      nextSession.status,
      Date.now(),
      nextSession.video_call_extended_until,
    );
    const canJoin = joinPhase === "open";
    const windowSoon = joinPhase === "too_early";

    return (
      <OverviewCard>
        <div className="border-b border-border/45 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--apple-tint-sky)_45%,white),transparent)] px-5 py-4">
          <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-[#007AFF] uppercase">
            {t("dashboard.overview.kicker")}
          </p>
          <h3 className="mt-1 font-display text-[1.2rem] tracking-[-0.03em] text-foreground">
            {t("dashboard.overview.title")}
          </h3>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-border/55 bg-card/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <p className="text-[0.72rem] font-medium text-muted-foreground">{t("dashboard.overview.therapistLabel")}</p>
            <p className="mt-1 font-display text-[1.2rem] tracking-[-0.02em] text-foreground">{therapistName}</p>
            <p className="mt-3 flex items-center gap-2 text-[0.88rem] leading-snug text-muted-foreground">
              <CalendarClock className="size-4 shrink-0 text-[#007AFF]" aria-hidden />
              {formatIstanbulSessionWindow(nextSession.starts_at, nextSession.ends_at, locale)}
            </p>
            {upcomingSessionCount > 1 ? (
              <p className="mt-2 text-[0.78rem] text-muted-foreground">
                {t("dashboard.overview.moreSessions", { count: upcomingSessionCount - 1 })}
              </p>
            ) : null}
            {canJoin || windowSoon ? (
              <p
                className={cn(
                  "mt-3 inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium",
                  canJoin
                    ? "bg-[#34C759]/12 text-[#1B7A36]"
                    : "bg-[#007AFF]/10 text-[#007AFF]",
                )}
              >
                {canJoin ? t("dashboard.overview.windowOpen") : t("dashboard.overview.windowSoon")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            {canJoin ? (
              <Button asChild size="lg" className="h-11 w-full rounded-xl">
                <Link href={`/dashboard/sessions/${nextSession.id}/call`}>
                  <Video className="size-4" />
                  {t("dashboard.overview.joinCall")}
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="lg" className="h-11 w-full rounded-xl">
              <Link href="/dashboard/sessions" className="inline-flex items-center justify-center gap-2">
                {t("dashboard.overview.allSessions")}
                <ChevronRight className="size-4 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </OverviewCard>
    );
  }

  if (!onboardingCompleted) {
    return (
      <OverviewCard>
        <div className="flex gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#007AFF14] text-[#007AFF]">
            <Compass className="size-5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="font-display text-[1.15rem] tracking-[-0.02em]">{t("dashboard.overview.onboardingTitle")}</h3>
            <p className="text-[0.86rem] leading-relaxed text-muted-foreground">
              {t("dashboard.overview.onboardingBody")}
            </p>
          </div>
        </div>
        <div className="border-t border-border/45 px-5 pb-5">
          <Button asChild size="lg" className="h-11 w-full rounded-xl">
            <Link href="/onboarding">{t("dashboard.overview.onboardingCta")}</Link>
          </Button>
        </div>
      </OverviewCard>
    );
  }

  return (
    <OverviewCard>
      <div className="flex gap-4 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#5856D614] text-[#5856D6]">
          <Sparkles className="size-5" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-display text-[1.15rem] tracking-[-0.02em]">{t("dashboard.overview.emptyTitle")}</h3>
          <p className="text-[0.86rem] leading-relaxed text-muted-foreground">{t("dashboard.overview.emptyBody")}</p>
        </div>
      </div>
      <div className="border-t border-border/45 px-5 pb-5">
        <Button asChild size="lg" className="h-11 w-full rounded-xl">
          <Link href="/dashboard/therapists">{t("dashboard.overview.bookCta")}</Link>
        </Button>
      </div>
    </OverviewCard>
  );
}
