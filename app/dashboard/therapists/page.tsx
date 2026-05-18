import type { Metadata } from "next";

import { TherapistsDiscoveryClient } from "@/components/therapists/discovery/therapists-discovery-client";
import { fetchOpenSlotsIndex } from "@/lib/supabase/availability-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchVerifiedTherapistProfiles } from "@/lib/supabase/therapist-repository";

export const metadata: Metadata = {
  title: "Terapistler",
  description: "Doğrulanmış terapistleri keşfet, filtrele ve profillerini incele.",
};

export default async function TherapistsPage() {
  const supabase = await createSupabaseServerClient();
  const [profiles, slotIndex] = await Promise.all([
    fetchVerifiedTherapistProfiles(supabase),
    fetchOpenSlotsIndex(supabase).catch(() => ({
      profileIds: new Set<string>(),
      slots: [] as { id: string; profileId: string; startsAt: string }[],
    })),
  ]);

  return (
    <TherapistsDiscoveryClient
      profiles={profiles}
      openProfileIds={[...slotIndex.profileIds]}
      openSlots={slotIndex.slots.map((s) => ({ profileId: s.profileId, startsAt: s.startsAt }))}
    />
  );
}
