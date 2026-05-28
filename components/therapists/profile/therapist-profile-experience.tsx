"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Mic,
  Star,
  Timer,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useI18n } from "@/components/i18n/i18n-provider";
import type { TherapistAvailabilityRow, TherapistProfileRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { fadeUp, onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { formatIstanbulDate, formatIstanbulTime } from "@/lib/i18n/datetime";
import { therapistRowToPreview } from "@/lib/onboarding/derive-therapist-preview";
import { cn } from "@/lib/utils";

import { BookingFlowSheet } from "../booking/booking-flow-sheet";

function nextSlotsPreview(slots: TherapistAvailabilityRow[], limit: number): TherapistAvailabilityRow[] {
  return [...slots]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, limit);
}

function ProfileTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-lg border border-[#007AFF33] bg-[#007AFF14] px-3 py-1.5 text-[0.78rem] font-semibold text-[#0A4B97] transition-colors hover:bg-[#007AFF24]">
      {children}
    </span>
  );
}

function TherapistProfileExperienceInner({
  profile,
  openSlots,
}: {
  profile: TherapistProfileRow;
  openSlots: TherapistAvailabilityRow[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingOpen, setBookingOpen] = useState(false);
  const gender = profile.gender === "male" || profile.gender === "female" ? profile.gender : "female";
  const preview = therapistRowToPreview(profile, gender);
  const rating = Number(profile.rating);
  const displayRating = Number.isFinite(rating) ? rating.toFixed(1) : "—";
  const sessionMinutes = Math.max(15, Math.floor(profile.session_duration_minutes || 50));
  const sessionFeeTry = Math.max(0, Math.floor(profile.session_fee_try || 0));
  const headlineSlots = useMemo(() => nextSlotsPreview(openSlots, 4), [openSlots]);

  useEffect(() => {
    if (searchParams.get("book") === "1") setBookingOpen(true);
  }, [searchParams]);

  const specializations = profile.specialization?.length ? profile.specialization : preview.specialties;

  return (
    <div className="relative mx-auto max-w-5xl space-y-0 pb-24">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative -mx-4 overflow-hidden rounded-b-[var(--radius-xl)] sm:-mx-6 lg:-mx-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.22_0.06_250)] via-[oklch(0.18_0.05_265)] to-[oklch(0.14_0.04_285)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNjRoNjRWNHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-40" />
        <motion.div
          className="absolute -right-20 top-0 size-80 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.14_195/0.35),transparent_65%)] blur-2xl"
          animate={{ opacity: [0.4, 0.65, 0.4], x: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-white/55">
            <Link href="/dashboard" className="transition-colors hover:text-white/90">
              {t("therapists.profile.breadcrumbHome")}
            </Link>
            <ChevronRight className="size-3.5 opacity-50" />
            <Link href="/dashboard/therapists" className="transition-colors hover:text-white/90">
              {t("therapists.profile.breadcrumbList")}
            </Link>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="text-white/85">{profile.full_name}</span>
          </nav>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-[2rem] tracking-[-0.03em] text-white sm:text-[2.6rem]"
          >
            {profile.full_name}
          </motion.h1>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative z-10 -mt-8 mx-2 overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.12] bg-[color-mix(in_oklch,var(--color-card),transparent_4%)] shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)] sm:mx-4"
      >
        <div className="pointer-events-none absolute inset-0 shimmer-surface opacity-30" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <div
            className={cn(
              "mx-auto grid size-[7.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl font-display text-3xl text-white/95 shadow-lg sm:mx-0",
              preview.accentClass,
            )}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              preview.initials
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full border border-[#007AFF30] bg-[#007AFF14] px-3 py-0.5 text-[0.72rem] font-semibold text-[#0A4B97]">
                {profile.professional_title?.trim() || t("common.professionalSupport")}
              </span>
              {profile.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
                  <BadgeCheck className="size-3.5" />
                  {t("therapists.profile.verified")}
                </span>
              ) : null}
            </div>
            <p className="font-display text-[1.65rem] tracking-[-0.02em]">{profile.full_name}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[0.88rem] sm:justify-start">
              <motion.span whileHover={{ scale: 1.04 }} className="inline-flex items-center gap-1.5 rounded-full border border-[#007AFF30] bg-[#007AFF14] px-3 py-1 font-semibold text-[#0A4B97]">
                <Timer className="size-4 text-primary" />
                {sessionMinutes} {t("therapists.discovery.minutesShort")}
              </motion.span>
              <motion.span whileHover={{ scale: 1.04 }} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 font-semibold text-emerald-700">
                {sessionFeeTry > 0
                  ? t("therapists.discovery.sessionFee", { fee: sessionFeeTry.toLocaleString("tr-TR") })
                  : t("therapists.discovery.bookToSeePrice")}
              </motion.span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Star className="size-4 text-amber-300/90" fill="currentColor" strokeWidth={0} />
                <span className="tabular-nums text-foreground/90">{displayRating}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 pt-1 text-[0.75rem] text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mic className="size-4 text-primary/80" />
                {t("therapists.discovery.audio")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Video className="size-4 text-primary/80" />
                {t("therapists.discovery.video")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Button
              type="button"
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-[oklch(0.72_0.14_195)] to-[oklch(0.58_0.16_210)] px-8 text-[0.95rem] font-semibold text-[oklch(0.14_0.04_265)] shadow-[0_12px_32px_-10px_oklch(0.55_0.14_195/0.55)] sm:w-auto"
              onClick={() => setBookingOpen(true)}
            >
              {t("therapists.profile.bookCta")}
              <ChevronRight className="ml-1 size-4" />
            </Button>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-muted-foreground">
              <Link href="/dashboard/therapists" className="inline-flex items-center gap-2">
                <ArrowLeft className="size-4" />
                {t("therapists.profile.backToList")}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content sections */}
      <div className="mx-2 mt-8 space-y-6 sm:mx-4">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%" }}
          className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] p-6 shadow-[var(--shadow-glass)] sm:p-8"
        >
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">{t("therapists.profile.about")}</h2>
          <p className="mt-4 text-[0.95rem] leading-[1.8] text-muted-foreground/95">
            {profile.bio?.trim() || "—"}
          </p>
        </motion.section>

        <motion.section
          variants={onboardingListContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-8%" }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <motion.div
            variants={onboardingListItem}
            className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] p-6 shadow-[var(--shadow-glass)]"
          >
            <h2 className="font-display text-[1.2rem] tracking-[-0.02em]">{t("therapists.profile.specialtiesTitle")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {specializations.length === 0 ? (
                <span className="text-[0.88rem] text-muted-foreground">—</span>
              ) : (
                specializations.map((s) => <ProfileTag key={s}>{s}</ProfileTag>)
              )}
            </div>
          </motion.div>

          <motion.div
            variants={onboardingListItem}
            className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] p-6 shadow-[var(--shadow-glass)]"
          >
            <h2 className="font-display text-[1.2rem] tracking-[-0.02em]">{t("therapists.profile.languagesTitle")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {preview.languages.length === 0 ? (
                <span className="text-[0.88rem] text-muted-foreground">—</span>
              ) : (
                preview.languages.map((lang) => <ProfileTag key={lang}>{lang}</ProfileTag>)
              )}
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%" }}
          className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] p-6 shadow-[var(--shadow-glass)] sm:p-8"
        >
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">{t("therapists.profile.availabilityTitle")}</h2>
          <p className="mt-2 text-[0.85rem] text-muted-foreground">{t("therapists.profile.availabilityHint")}</p>
          {headlineSlots.length === 0 ? (
            <p className="mt-4 text-[0.88rem] text-muted-foreground">{t("therapists.profile.noSlots")}</p>
          ) : (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {headlineSlots.map((s) => (
                <motion.li
                  key={s.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[0.85rem]"
                >
                  <span className="text-foreground">{formatIstanbulDate(s.starts_at)}</span>
                  <span className="font-medium text-primary">{formatIstanbulTime(s.starts_at)}</span>
                </motion.li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            variant="outline"
            className="mt-6 rounded-xl border-primary/30 bg-primary/10 hover:bg-primary/15"
            onClick={() => setBookingOpen(true)}
          >
            {t("therapists.profile.openCalendar")}
          </Button>
        </motion.section>
      </div>

      <BookingFlowSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        therapistName={profile.full_name}
        slots={openSlots}
        onCompleted={() => router.refresh()}
      />
    </div>
  );
}

export function TherapistProfileExperience(props: {
  profile: TherapistProfileRow;
  openSlots: TherapistAvailabilityRow[];
}) {
  return (
    <Suspense fallback={null}>
      <TherapistProfileExperienceInner {...props} />
    </Suspense>
  );
}
