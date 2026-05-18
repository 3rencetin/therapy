"use client";

import { motion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem, onboardingStepIn } from "@/lib/animations";
import { premiumEase } from "@/lib/animations/easing";
import type { TherapistPreview } from "@/lib/data/therapist-previews";
import { cn } from "@/lib/utils";

function TherapistMatchCard({ therapist, index }: { therapist: TherapistPreview; index: number }) {
  const { t } = useI18n();
  return (
    <motion.article
      variants={onboardingListItem}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 420, damping: 28 } }}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-xl)] border border-border/55 bg-[color-mix(in_oklch,var(--color-card),transparent_12%)] p-5 shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)]",
        index === 0 && "ring-1 ring-white/[0.08]",
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[radial-gradient(circle,oklch(0.9_0.04_95/0.06),transparent_68%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex gap-4">
        <div
          className={cn(
            "flex size-[4.25rem] shrink-0 items-center justify-center rounded-2xl font-display text-lg tracking-tight text-white/90",
            therapist.accentClass,
          )}
        >
          {therapist.initials}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="truncate font-display text-[1.15rem] tracking-[-0.02em] text-foreground">{therapist.name}</h3>
            <p className="text-[0.8125rem] text-muted-foreground">{therapist.role}</p>
          </div>
          <p className="text-[0.78rem] leading-relaxed text-muted-foreground/90">{therapist.tone}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {therapist.specialties.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-md border border-border/50 bg-white/[0.03] px-2 py-0.5 text-[0.68rem] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-[0.72rem] text-muted-foreground/85">
            <span>
              <span className="text-muted-foreground/55">{t("onboarding.match.lang")} </span>
              {therapist.languages.join(" · ")}
            </span>
            <span>
              <span className="text-muted-foreground/55">{t("onboarding.match.avail")} </span>
              {therapist.availability.join(" · ")}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      variants={onboardingListItem}
      className="rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.03] p-5"
    >
      <div className="flex gap-4">
        <motion.div
          className="size-[4.25rem] shrink-0 rounded-2xl bg-white/[0.06]"
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: premiumEase, delay: index * 0.12 }}
        />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
          <div className="h-3 w-1/3 rounded bg-white/[0.05]" />
          <div className="h-3 w-full rounded bg-white/[0.04]" />
        </div>
      </div>
    </motion.div>
  );
}

export function StepMatchPreview({
  therapists,
  loading,
  errorMessage,
}: {
  therapists: TherapistPreview[];
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const { t } = useI18n();

  return (
    <motion.div variants={onboardingStepIn} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <header className="space-y-3">
        <p className="text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">{t("onboarding.match.kicker")}</p>
        <h2 className="font-display text-balance text-[clamp(1.65rem,4.2vw,2.35rem)] leading-[1.08] tracking-[-0.02em]">
          {t("onboarding.match.title")}
        </h2>
        <p className="max-w-lg text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
          {t("onboarding.match.body")}
        </p>
      </header>

      {errorMessage ? (
        <p className="rounded-lg border border-border/60 bg-white/[0.03] px-3 py-3 text-[0.875rem] leading-relaxed text-muted-foreground">
          {errorMessage}
        </p>
      ) : null}

      {loading ? (
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          {therapists.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-border/50 bg-white/[0.025] px-4 py-6 text-center text-[0.9rem] leading-relaxed text-muted-foreground">
              {t("onboarding.match.empty")}
            </p>
          ) : (
            therapists.map((row, i) => <TherapistMatchCard key={row.id} therapist={row} index={i} />)
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
