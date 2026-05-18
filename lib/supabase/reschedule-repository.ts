import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { fetchOpenAvailabilityForProfile } from "@/lib/supabase/availability-repository";
import type { TherapistAvailabilityRow } from "@/types/database";

export type RescheduleRequestRow = {
  id: string;
  session_id: string;
  proposed_by: string;
  proposed_availability_id: string;
  status: string;
  created_at: string;
  booked_sessions: {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    profile_id: string;
    user_id: string;
  } | null;
  proposed_slot: TherapistAvailabilityRow | null;
};

function normalizeProposedSlot(raw: unknown): TherapistAvailabilityRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.starts_at !== "string" || typeof o.ends_at !== "string") return null;
  return raw as TherapistAvailabilityRow;
}

export async function fetchRescheduleSlotsForProfile(
  client: AppSupabaseClient,
  profileId: string,
): Promise<TherapistAvailabilityRow[]> {
  return fetchOpenAvailabilityForProfile(client, profileId);
}

export async function fetchPendingRescheduleRequestsForClient(
  client: AppSupabaseClient,
  userId: string,
): Promise<RescheduleRequestRow[]> {
  const { data: sessions, error: sErr } = await client
    .from("booked_sessions")
    .select("id")
    .eq("user_id", userId);

  if (sErr) throw sErr;
  const ids = (sessions ?? []).map((s) => s.id);
  if (ids.length === 0) return [];

  const { data, error } = await client
    .from("session_reschedule_requests")
    .select(
      `
      id,
      session_id,
      proposed_by,
      proposed_availability_id,
      status,
      created_at,
      booked_sessions ( id, starts_at, ends_at, status, profile_id, user_id ),
      proposed_slot:therapist_availability!session_reschedule_requests_proposed_availability_id_fkey (
        id, profile_id, starts_at, ends_at, created_at
      )
    `,
    )
    .in("session_id", ids)
    .eq("status", "pending");

  if (error) throw error;
  const rows = (data ?? []) as unknown as RescheduleRequestRow[];
  return rows.map((r) => ({
    ...r,
    proposed_slot: normalizeProposedSlot(r.proposed_slot as unknown),
  }));
}

export async function fetchPendingRescheduleRequestsForTherapist(
  client: AppSupabaseClient,
  profileId: string,
): Promise<RescheduleRequestRow[]> {
  const { data: sessions, error: sErr } = await client
    .from("booked_sessions")
    .select("id")
    .eq("profile_id", profileId);

  if (sErr) throw sErr;
  const ids = (sessions ?? []).map((s) => s.id);
  if (ids.length === 0) return [];

  const { data, error } = await client
    .from("session_reschedule_requests")
    .select(
      `
      id,
      session_id,
      proposed_by,
      proposed_availability_id,
      status,
      created_at,
      booked_sessions ( id, starts_at, ends_at, status, profile_id, user_id ),
      proposed_slot:therapist_availability!session_reschedule_requests_proposed_availability_id_fkey (
        id, profile_id, starts_at, ends_at, created_at
      )
    `,
    )
    .in("session_id", ids)
    .eq("status", "pending");

  if (error) throw error;
  const rows = (data ?? []) as unknown as RescheduleRequestRow[];
  return rows.map((r) => ({
    ...r,
    proposed_slot: normalizeProposedSlot(r.proposed_slot as unknown),
  }));
}
