"use client";

import { motion } from "framer-motion";
import { Filter, LayoutGrid, List, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";
import type { TherapistLayoutMode } from "@/lib/therapists/discovery-filters";
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
  layoutMode,
  onLayoutModeChange,
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
  layoutMode: TherapistLayoutMode;
  onLayoutModeChange: (mode: TherapistLayoutMode) => void;
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
  const mergedAvail = Array.from(new Set([...facets.availability, ...AVAILABILITY_BUCKET_LABELS])).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">Keşfet</p>
          <h1 className="font-display text-[1.85rem] tracking-[-0.03em] text-balance sm:text-[2.1rem]">
            Sana uygun terapist
          </h1>
          <p className="max-w-xl text-[0.92rem] leading-relaxed text-muted-foreground">
            Yumuşak bir ritimle ilerleyin; filtreler özgür ama sakin—dilediğin kadarını seç.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-border/55 bg-white/[0.03] p-1 shadow-[inset_0_1px_0_oklch(1_0_0/0.04)]">
            <Button
              type="button"
              size="sm"
              variant={layoutMode === "grid" ? "subtle" : "ghost"}
              className={cn("h-9 gap-2 rounded-lg px-3", layoutMode === "grid" ? "bg-white/[0.08]" : "")}
              onClick={() => onLayoutModeChange("grid")}
            >
              <LayoutGrid className="size-4" />
              Izgara
            </Button>
            <Button
              type="button"
              size="sm"
              variant={layoutMode === "list" ? "subtle" : "ghost"}
              className={cn("h-9 gap-2 rounded-lg px-3", layoutMode === "list" ? "bg-white/[0.08]" : "")}
              onClick={() => onLayoutModeChange("list")}
            >
              <List className="size-4" />
              Liste
            </Button>
          </div>
          <Button type="button" variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={reset}>
            <SlidersHorizontal className="size-4" />
            Sıfırla
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-4 shadow-[var(--shadow-glass)] backdrop-blur-[14px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="İsim, uzmanlık veya anahtar kelime"
              className="h-11 rounded-xl border-border/60 bg-background/25 pl-10 pr-10 text-[0.9rem]"
              aria-label="Terapist ara"
            />
            <Sparkles className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/16" />
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[0.75rem] text-muted-foreground sm:flex-col sm:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/45 bg-white/[0.02] px-2.5 py-1">
              <Filter className="size-3.5 opacity-70" />
              <span>
                <span className="text-foreground/90">{resultCount}</span>
                <span className="text-muted-foreground/80"> / {total}</span>
              </span>
            </span>
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground/70">Canlı sonuç</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">Cinsiyet</p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryChip
              label="Kadın"
              active={filters.genders.includes("female")}
              onClick={() => toggleGender("female")}
            />
            <DiscoveryChip label="Erkek" active={filters.genders.includes("male")} onClick={() => toggleGender("male")} />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">Müsait zaman</p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryChip label="Açık slot" active={filters.onlyWithOpenSlot} onClick={toggleOnlyOpen} />
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
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">Uzmanlık</p>
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
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">Dil</p>
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
