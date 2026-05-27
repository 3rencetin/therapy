import type { BookedSessionListRow } from "@/lib/supabase/booking-repository";

const ACTIVE_STATUSES = new Set(["pending", "confirmed"]);

export function pickNextUpcomingSession(bookings: BookedSessionListRow[], nowMs = Date.now()) {
  return (
    bookings.find((b) => {
      if (!ACTIVE_STATUSES.has(b.status)) return false;
      return new Date(b.ends_at).getTime() > nowMs;
    }) ?? null
  );
}

export function countUpcomingSessions(bookings: BookedSessionListRow[], nowMs = Date.now()) {
  return bookings.filter((b) => {
    if (!ACTIVE_STATUSES.has(b.status)) return false;
    return new Date(b.ends_at).getTime() > nowMs;
  }).length;
}
