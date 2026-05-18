import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { TherapistAvailabilityRow } from "@/types/database";

export async function fetchAvailabilitySlotById(
  client: AppSupabaseClient,
  availabilityId: string,
): Promise<TherapistAvailabilityRow | null> {
  const { data, error } = await client
    .from("therapist_availability")
    .select("*")
    .eq("id", availabilityId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchOpenAvailabilityForProfile(
  client: AppSupabaseClient,
  profileId: string,
): Promise<TherapistAvailabilityRow[]> {
  const nowIso = new Date().toISOString();
  const { data: slots, error: slotsError } = await client
    .from("therapist_availability")
    .select("*")
    .eq("profile_id", profileId)
    .gt("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (slotsError) throw slotsError;
  if (!slots?.length) return [];

  const ids = slots.map((s) => s.id);
  const { data: taken, error: takenError } = await client
    .from("booked_sessions")
    .select("availability_id")
    .in("availability_id", ids)
    .in("status", ["pending", "confirmed"]);

  if (takenError) throw takenError;

  const takenSet = new Set((taken ?? []).map((row) => row.availability_id).filter(Boolean));
  return slots.filter((slot) => !takenSet.has(slot.id));
}

export type OpenSlotMeta = { id: string; profileId: string; startsAt: string };

export async function fetchOpenSlotsIndex(client: AppSupabaseClient): Promise<{
  profileIds: Set<string>;
  slots: OpenSlotMeta[];
}> {
  const nowIso = new Date().toISOString();
  const { data: slots, error: slotsError } = await client
    .from("therapist_availability")
    .select("id, profile_id, starts_at")
    .gt("starts_at", nowIso);

  if (slotsError) throw slotsError;
  if (!slots?.length) return { profileIds: new Set(), slots: [] };

  const ids = slots.map((s) => s.id);
  const { data: taken, error: takenError } = await client
    .from("booked_sessions")
    .select("availability_id")
    .in("availability_id", ids)
    .in("status", ["pending", "confirmed"]);

  if (takenError) throw takenError;

  const takenSet = new Set((taken ?? []).map((row) => row.availability_id).filter(Boolean));
  const open = slots.filter((s) => !takenSet.has(s.id));

  return {
    profileIds: new Set(open.map((s) => s.profile_id)),
    slots: open.map((s) => ({
      id: s.id,
      profileId: s.profile_id,
      startsAt: s.starts_at,
    })),
  };
}
