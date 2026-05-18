import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { BookedSessionRow } from "@/types/database";

export type TherapistBookingClient = {
  full_name: string | null;
  email: string | null;
};

export type TherapistPrepPage = {
  sort_order: number;
  title: string;
  body: string;
  updated_at: string;
};

export type TherapistBookingRow = Pick<
  BookedSessionRow,
  | "id"
  | "user_id"
  | "starts_at"
  | "ends_at"
  | "status"
  | "payment_status"
  | "notes"
  | "video_call_extended_until"
> & {
  client: TherapistBookingClient | null;
  prep_pages: TherapistPrepPage[];
};

type BookedSessionWithClientJoin = Pick<
  BookedSessionRow,
  | "id"
  | "user_id"
  | "starts_at"
  | "ends_at"
  | "status"
  | "payment_status"
  | "notes"
  | "video_call_extended_until"
> & {
  client: TherapistBookingClient | TherapistBookingClient[] | null;
  prep_pages: TherapistPrepPage[] | null;
};

function normalizePrepPages(raw: BookedSessionWithClientJoin["prep_pages"]): TherapistPrepPage[] {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [];
  const out: TherapistPrepPage[] = [];
  for (const x of arr) {
    if (!x || typeof x !== "object") continue;
    const r = x as Record<string, unknown>;
    out.push({
      sort_order: typeof r.sort_order === "number" ? r.sort_order : Number(r.sort_order),
      title: typeof r.title === "string" ? r.title : "",
      body: typeof r.body === "string" ? r.body : "",
      updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
    });
  }
  return out.sort((a, b) => a.sort_order - b.sort_order);
}

function normalizeEmbeddedClient(
  raw: BookedSessionWithClientJoin["client"],
): TherapistBookingClient | null {
  if (raw == null) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row || typeof row !== "object") return null;
  return {
    full_name: typeof row.full_name === "string" ? row.full_name : null,
    email: typeof row.email === "string" ? row.email : row.email === null ? null : null,
  };
}

export function therapistBookingClientLabel(row: TherapistBookingRow): string {
  const name = row.client?.full_name?.trim();
  if (name) return name;
  const email = row.client?.email?.trim();
  if (email) return email;
  return `Danışan ${row.user_id.slice(0, 8)}…`;
}

export async function fetchBookingsForTherapistProfile(
  client: AppSupabaseClient,
  profileId: string,
): Promise<TherapistBookingRow[]> {
  const { data, error } = await client
    .from("booked_sessions")
    .select(
      `
      id,
      user_id,
      starts_at,
      ends_at,
      status,
      payment_status,
      notes,
      video_call_extended_until,
      client:profiles!booked_sessions_user_id_profiles_fkey(full_name, email),
      prep_pages:booked_session_notebook_pages(sort_order,title,body,updated_at)
    `,
    )
    .eq("profile_id", profileId)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as BookedSessionWithClientJoin[];
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
    status: r.status,
    payment_status: r.payment_status,
    notes: r.notes,
    video_call_extended_until: r.video_call_extended_until,
    client: normalizeEmbeddedClient(r.client),
    prep_pages: normalizePrepPages(r.prep_pages),
  }));
}
