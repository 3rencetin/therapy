import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { TherapistProfileRow } from "@/types/database";

export type AdminOverviewStats = {
  userCount: number;
  therapistDirectoryCount: number;
  verifiedTherapistCount: number;
  sessionCount: number;
  onboardingCompletedCount: number;
};

export async function fetchAdminOverview(client: AppSupabaseClient): Promise<AdminOverviewStats> {
  const [users, therapists, verifiedQ, sessions, onboardingDone] = await Promise.all([
    client.from("profiles").select("id", { count: "exact", head: true }),
    client.from("therapist_profiles").select("profile_id", { count: "exact", head: true }),
    client
      .from("therapist_profiles")
      .select("profile_id", { count: "exact", head: true })
      .eq("verified", true),
    client.from("booked_sessions").select("id", { count: "exact", head: true }),
    client
      .from("onboarding_answers")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null),
  ]);

  const errs = [users.error, therapists.error, verifiedQ.error, sessions.error, onboardingDone.error].filter(Boolean);
  if (errs.length) throw errs[0];

  return {
    userCount: users.count ?? 0,
    therapistDirectoryCount: therapists.count ?? 0,
    verifiedTherapistCount: verifiedQ.count ?? 0,
    sessionCount: sessions.count ?? 0,
    onboardingCompletedCount: onboardingDone.count ?? 0,
  };
}

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
  banned_at: string | null;
  created_at: string;
};

export async function fetchAdminUsers(client: AppSupabaseClient, limit = 100): Promise<AdminUserRow[]> {
  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name, role, banned_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AdminUserRow[];
}

export async function fetchAdminTherapists(client: AppSupabaseClient): Promise<TherapistProfileRow[]> {
  const { data, error } = await client
    .from("therapist_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TherapistProfileRow[];
}

export type AdminSessionRow = {
  id: string;
  user_id: string;
  profile_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_status: string;
  created_at: string;
  therapist_profiles: { full_name: string } | null;
};

export async function fetchAdminRecentSessions(client: AppSupabaseClient, limit = 40): Promise<AdminSessionRow[]> {
  const { data, error } = await client
    .from("booked_sessions")
    .select(
      `
        id,
        user_id,
        profile_id,
        starts_at,
        ends_at,
        status,
        payment_status,
        created_at,
        therapist_profiles ( full_name )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as AdminSessionRow[];
}

export type AdminBookingPipeline = {
  total: number;
  upcomingActive: number;
  cancelled: number;
  cancellationRate: number;
  paid: number;
  paidShare: number;
  uniqueTherapists: number;
};

export async function fetchAdminBookingPipeline(client: AppSupabaseClient): Promise<AdminBookingPipeline> {
  const { data, error } = await client
    .from("booked_sessions")
    .select("status, payment_status, starts_at, profile_id");

  if (error) throw error;
  const rows = data ?? [];
  const now = Date.now();
  const total = rows.length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;
  const upcomingActive = rows.filter(
    (r) =>
      (r.status === "pending" || r.status === "confirmed") && new Date(r.starts_at).getTime() >= now,
  ).length;
  const paid = rows.filter((r) => r.payment_status === "paid").length;
  const therapists = new Set(rows.map((r) => r.profile_id));

  return {
    total,
    upcomingActive,
    cancelled,
    cancellationRate: total === 0 ? 0 : cancelled / total,
    paid,
    paidShare: total === 0 ? 0 : paid / total,
    uniqueTherapists: therapists.size,
  };
}

export type AdminReschedulePipeline = {
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
};

export async function fetchAdminReschedulePipeline(client: AppSupabaseClient): Promise<AdminReschedulePipeline> {
  const { data, error } = await client.from("session_reschedule_requests").select("status");
  if (error) throw error;
  const rows = data ?? [];
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  return {
    pending: count("pending"),
    accepted: count("accepted"),
    rejected: count("rejected"),
    cancelled: count("cancelled"),
  };
}
