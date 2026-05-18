export const VIDEO_JOIN_EARLY_MS = 30 * 60 * 1000;

/** Görüşme kapanmadan 5 dk önce uyarı */
export const VIDEO_WRAPUP_WARN_MS = 5 * 60 * 1000;

export type VideoJoinPhase = "too_early" | "open" | "ended" | "cancelled" | "invalid_status";

export function getSessionVideoEffectiveEndMs(
  endsAt: string,
  videoExtendedUntil: string | null | undefined,
): number {
  const baseEnd = new Date(endsAt).getTime();
  if (Number.isNaN(baseEnd)) return 0;
  const ext = videoExtendedUntil ? new Date(videoExtendedUntil).getTime() : baseEnd;
  if (Number.isNaN(ext)) return baseEnd;
  return Math.max(baseEnd, ext);
}

/** Liste / token: takvim bitişi veya terapist uzatımından geç olan süre. */
export function getVideoJoinPhase(
  startsAt: string,
  endsAt: string,
  status: string,
  nowMs: number = Date.now(),
  videoExtendedUntil?: string | null,
): VideoJoinPhase {
  if (status === "cancelled") return "cancelled";
  if (status !== "pending" && status !== "confirmed") return "invalid_status";
  const start = new Date(startsAt).getTime();
  const effectiveEnd = getSessionVideoEffectiveEndMs(endsAt, videoExtendedUntil);
  if (Number.isNaN(start) || effectiveEnd <= 0) return "invalid_status";
  if (nowMs >= effectiveEnd) return "ended";
  if (nowMs < start - VIDEO_JOIN_EARLY_MS) return "too_early";
  return "open";
}
