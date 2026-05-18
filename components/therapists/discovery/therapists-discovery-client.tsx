"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { TherapistProfileRow } from "@/types/database";
import { TherapistPremiumCard } from "@/components/dashboard/therapist-premium-card";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";
import {
  collectDiscoveryFacets,
  defaultTherapistDiscoveryFilters,
  filterTherapistProfiles,
  type TherapistDiscoveryFilters,
  type TherapistLayoutMode,
} from "@/lib/therapists/discovery-filters";
import { cn } from "@/lib/utils";

import { DiscoveryEmptyState } from "./discovery-empty-state";
import { DiscoveryFilterBar } from "./discovery-filter-bar";

export function TherapistsDiscoveryClient({
  profiles,
  openProfileIds,
  openSlots,
}: {
  profiles: TherapistProfileRow[];
  openProfileIds: string[];
  openSlots: { profileId: string; startsAt: string }[];
}) {
  const [filters, setFilters] = useState<TherapistDiscoveryFilters>(defaultTherapistDiscoveryFilters);
  const [layoutMode, setLayoutMode] = useState<TherapistLayoutMode>("grid");

  const facets = useMemo(() => collectDiscoveryFacets(profiles), [profiles]);

  const openSet = useMemo(() => new Set(openProfileIds), [openProfileIds]);

  const filtered = useMemo(
    () => filterTherapistProfiles(profiles, filters, openSet, openSlots),
    [profiles, filters, openSet, openSlots],
  );

  const toggleInArray = <T,>(list: T[], value: T, eq: (a: T, b: T) => boolean) => {
    const exists = list.some((x) => eq(x, value));
    return exists ? list.filter((x) => !eq(x, value)) : [...list, value];
  };

  const toggleSpecialty = (value: string) => {
    setFilters((f) => ({
      ...f,
      specialties: toggleInArray(f.specialties, value, (a, b) => a === b),
    }));
  };

  const toggleLanguage = (value: string) => {
    setFilters((f) => ({
      ...f,
      languages: toggleInArray(f.languages, value, (a, b) => a === b),
    }));
  };

  const toggleAvailability = (value: string) => {
    setFilters((f) => ({
      ...f,
      availabilityLabels: toggleInArray(f.availabilityLabels, value, (a, b) => a === b),
    }));
  };

  const toggleGender = (value: "male" | "female") => {
    setFilters((f) => ({
      ...f,
      genders: toggleInArray(f.genders, value, (a, b) => a === b),
    }));
  };

  const toggleOnlyOpen = () => {
    setFilters((f) => ({ ...f, onlyWithOpenSlot: !f.onlyWithOpenSlot }));
  };

  const reset = () => setFilters(defaultTherapistDiscoveryFilters);

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <DiscoveryFilterBar
        query={filters.query}
        onQueryChange={(v) => setFilters((f) => ({ ...f, query: v }))}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        facets={facets}
        filters={filters}
        toggleSpecialty={toggleSpecialty}
        toggleLanguage={toggleLanguage}
        toggleAvailability={toggleAvailability}
        toggleGender={toggleGender}
        toggleOnlyOpen={toggleOnlyOpen}
        reset={reset}
        resultCount={filtered.length}
        total={profiles.length}
      />

      {filtered.length === 0 ? (
        <DiscoveryEmptyState onReset={reset} />
      ) : (
        <motion.div
          key={layoutMode}
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className={cn(
            "grid gap-4",
            layoutMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          {filtered.map((profile, idx) => (
            <motion.div key={profile.profile_id} variants={onboardingListItem} layout>
              <TherapistPremiumCard
                profile={profile}
                featured={idx === 0}
                variant={layoutMode === "grid" ? "compact" : "hero"}
                href={`/dashboard/therapists/${profile.profile_id}`}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
