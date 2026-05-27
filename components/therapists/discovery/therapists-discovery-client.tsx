"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { TherapistProfileRow } from "@/types/database";
import { fadeUp } from "@/lib/animations";
import {
  collectDiscoveryFacets,
  defaultTherapistDiscoveryFilters,
  filterTherapistProfiles,
  type TherapistDiscoveryFilters,
} from "@/lib/therapists/discovery-filters";

import { DiscoveryEmptyState } from "./discovery-empty-state";
import { DiscoveryFilterBar } from "./discovery-filter-bar";
import { TherapistMarketplaceCard } from "./therapist-marketplace-card";

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
    <div className="relative mx-auto max-w-6xl space-y-10 pb-24">
      <motion.div
        className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.14_195/0.2),transparent_70%)] blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 top-32 size-64 rounded-full bg-[radial-gradient(circle,oklch(0.4_0.16_285/0.18),transparent_70%)] blur-3xl"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <DiscoveryFilterBar
        query={filters.query}
        onQueryChange={(v) => setFilters((f) => ({ ...f, query: v }))}
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
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((profile, idx) => (
            <TherapistMarketplaceCard
              key={profile.profile_id}
              profile={profile}
              href={`/dashboard/therapists/${profile.profile_id}`}
              hasOpenSlot={openSet.has(profile.profile_id)}
              index={idx}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
