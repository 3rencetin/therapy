"use client";

import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { AVAILABILITY_BUCKET_LABELS } from "@/lib/therapists/slot-buckets";

import { DiscoveryChip } from "./discovery-chip";

type Facets = {
  specialties: string[];
  languages: string[];
  availability: string[];
};

export function DiscoveryFilterBar({
  query,
  onQueryChange,
  facets,
  filters,
  toggleSpecialty,
  toggleLanguage,
  toggleAvailability,
  toggleGender,
  toggleOnlyOpen,
  reset,
  resultCount,
  total,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  facets: Facets;
  filters: {
    specialties: string[];
    languages: string[];
    availabilityLabels: string[];
    genders: Array<"male" | "female">;
    onlyWithOpenSlot: boolean;
  };
  toggleSpecialty: (value: string) => void;
  toggleLanguage: (value: string) => void;
  toggleAvailability: (value: string) => void;
  toggleGender: (value: "male" | "female") => void;
  toggleOnlyOpen: () => void;
  reset: () => void;
  resultCount: number;
  total: number;
}) {
  const { t } = useI18n();
  const mergedAvail = Array.from(new Set([...facets.availability, ...AVAILABILITY_BUCKET_LABELS])).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative space-y-6">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-[0.72rem] font-medium tracking-[0.2em] text-primary/90 uppercase"
        >
          {t("therapists.discovery.kicker")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-3 max-w-2xl font-display text-[1.75rem] leading-[1.15] tracking-[-0.03em] text-balance sm:text-[2.35rem]"
        >
          {t("therapists.discovery.title")}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18 }}
          className="mx-auto mt-5 inline-flex"
        >
          <span className="rounded-full border border-primary/30 bg-gradient-to-r from-[oklch(0.55_0.14_195/0.25)] to-[oklch(0.48_0.16_285/0.2)] px-5 py-2 text-[0.82rem] font-medium text-foreground/95 shadow-[0_8px_32px_-12px_oklch(0.45_0.14_195/0.4)]">
            {t("therapists.discovery.specialtyFilterHint")}
          </span>
        </motion.div>
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.1] bg-[color-mix(in_oklch,var(--color-card),transparent_8%)] p-5 shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)] sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.14_195/0.5)] to-transparent" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("therapists.discovery.searchPlaceholder")}
              className="h-12 rounded-xl border-white/[0.1] bg-background/40 pl-10 pr-10 text-[0.9rem] transition-[box-shadow,border-color] focus-visible:border-primary/40 focus-visible:shadow-[0_0_0_3px_oklch(0.72_0.14_195/0.15)]"
              aria-label={t("therapists.discovery.searchPlaceholder")}
            />
            <Sparkles className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary/40" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[0.78rem] text-muted-foreground">
              <Filter className="size-3.5 opacity-70" />
              <span className="tabular-nums text-foreground/90">{resultCount}</span>
              <span>/ {total}</span>
            </span>
            <Button type="button" variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground" onClick={reset}>
              <SlidersHorizontal className="size-4" />
              {t("therapists.discovery.reset")}
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
            {t("therapists.discovery.gender")}
          </p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryChip
              label={t("therapists.discovery.female")}
              active={filters.genders.includes("female")}
              onClick={() => toggleGender("female")}
            />
            <DiscoveryChip label={t("therapists.discovery.male")} active={filters.genders.includes("male")} onClick={() => toggleGender("male")} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
            {t("therapists.discovery.availability")}
          </p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryChip label={t("therapists.discovery.openSlot")} active={filters.onlyWithOpenSlot} onClick={toggleOnlyOpen} />
            {mergedAvail.map((label) => (
              <DiscoveryChip
                key={label}
                label={label}
                active={filters.availabilityLabels.includes(label)}
                onClick={() => toggleAvailability(label)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
            {t("therapists.discovery.specialties")}
          </p>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {facets.specialties.map((s) => (
              <DiscoveryChip
                key={s}
                label={s}
                active={filters.specialties.includes(s)}
                onClick={() => toggleSpecialty(s)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
            {t("therapists.discovery.languages")}
          </p>
          <div className="flex flex-wrap gap-2">
            {facets.languages.map((s) => (
              <DiscoveryChip
                key={s}
                label={s}
                active={filters.languages.includes(s)}
                onClick={() => toggleLanguage(s)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
