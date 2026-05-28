"use client";

import { motion } from "framer-motion";
import { Coins, Mic, Star, Timer, Video } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { softSpring } from "@/lib/animations/easing";
import { therapistRowToPreview } from "@/lib/onboarding/derive-therapist-preview";
import type { TherapistProfileRow } from "@/types/database";
import { cn } from "@/lib/utils";

export function TherapistMarketplaceCard({
  profile,
  href,
  hasOpenSlot,
  index = 0,
}: {
  profile: TherapistProfileRow;
  href: string;
  hasOpenSlot?: boolean;
  index?: number;
}) {
  const { t } = useI18n();
  const gender = profile.gender === "male" || profile.gender === "female" ? profile.gender : "female";
  const preview = therapistRowToPreview(profile, gender);
  const rating = Number(profile.rating);
  const displayRating = Number.isFinite(rating) ? rating.toFixed(1) : "—";
  const specialtyLine =
    preview.specialties.length > 0
      ? preview.specialties.slice(0, 5).join(", ")
      : preview.tone;
  const sessionMinutes = Math.max(15, Math.floor(profile.session_duration_minutes || 50));
  const sessionFeeTry = Math.max(0, Math.floor(profile.session_fee_try || 0));

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...softSpring, delay: Math.min(index * 0.06, 0.45) }}
      whileHover={{ y: -8, transition: softSpring }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.1] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_50%_0%,oklch(0.55_0.14_195/0.12),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[radial-gradient(circle,oklch(0.5_0.16_285/0.2),transparent_70%)] blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

      <Link href={href} className="relative flex flex-1 flex-col px-6 pb-4 pt-7 outline-none focus-visible:ring-2 focus-visible:ring-ring/70">
        <div className="mx-auto relative">
          <div
            className={cn(
              "relative grid size-[5.5rem] place-items-center overflow-hidden rounded-full font-display text-2xl tracking-tight text-white/95 ring-[3px] ring-[oklch(0.72_0.14_195/0.45)] transition-transform duration-500 group-hover:scale-[1.04]",
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
          {hasOpenSlot ? (
            <span
              className="absolute bottom-1 right-1 size-3.5 rounded-full border-2 border-[oklch(0.17_0.04_265)] bg-emerald-400 shadow-[0_0_12px_oklch(0.72_0.18_155/0.6)]"
              title={t("therapists.discovery.onlineNow")}
            />
          ) : null}
        </div>

        <div className="mt-4 space-y-2 text-center">
          <span className="inline-flex rounded-full border border-[#007AFF30] bg-[#007AFF14] px-3 py-0.5 text-[0.68rem] font-semibold tracking-wide text-[#0B4EA2]">
            {profile.professional_title?.trim() || t("common.professionalSupport")}
          </span>
          <h3 className="font-display text-[1.35rem] tracking-[-0.02em] text-foreground">{profile.full_name}</h3>
          <p className="mx-auto line-clamp-3 min-h-[3.75rem] max-w-[280px] text-[0.8rem] leading-relaxed text-muted-foreground">
            {specialtyLine}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1 text-[0.72rem] text-muted-foreground">
          <Star className="size-3.5 text-amber-300/90" fill="currentColor" strokeWidth={0} />
          <span className="tabular-nums text-foreground/90">{displayRating}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{t("therapists.discovery.yearsExp", { years: profile.years_of_experience })}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[0.72rem] text-muted-foreground">
          <span className="inline-flex flex-col items-center gap-1">
            <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-primary">
              <Mic className="size-4" strokeWidth={1.75} />
            </span>
            {t("therapists.discovery.audio")}
          </span>
          <span className="inline-flex flex-col items-center gap-1">
            <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-primary">
              <Video className="size-4" strokeWidth={1.75} />
            </span>
            {t("therapists.discovery.video")}
          </span>
        </div>
      </Link>

      <div className="mx-6 h-[3px] rounded-full bg-gradient-to-r from-[oklch(0.72_0.14_195)] via-[oklch(0.62_0.16_210)] to-[oklch(0.58_0.16_285)] opacity-90" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex flex-wrap items-center gap-2 text-[0.82rem]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#007AFF2E] bg-[linear-gradient(135deg,#007AFF1F,#5AC8FA26)] px-3 py-1 font-semibold text-[#0A4B97] shadow-[0_8px_20px_-12px_rgba(0,122,255,0.45)]">
            <Timer className="size-3.5" />
            {sessionMinutes} {t("therapists.discovery.minutesShort")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[linear-gradient(135deg,rgba(52,199,89,0.14),rgba(16,185,129,0.2))] px-3 py-1 font-semibold text-emerald-700 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.45)]">
            <Coins className="size-3.5" />
            {sessionFeeTry > 0
              ? t("therapists.discovery.sessionFee", { fee: sessionFeeTry.toLocaleString("tr-TR") })
              : t("therapists.discovery.bookToSeePrice")}
          </span>
        </motion.div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-xl border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]"
          >
            <Link href={href}>{t("therapists.discovery.viewProfile")}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-gradient-to-r from-[oklch(0.58_0.18_285)] to-[oklch(0.52_0.16_265)] text-white shadow-[0_8px_24px_-8px_oklch(0.45_0.18_285/0.55)] hover:opacity-95"
          >
            <Link href={`${href}?book=1`}>{t("therapists.discovery.bookCta")}</Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
