/**
 * Müsaitlik: takvim günü (YYYY-MM-DD) + İstanbul duvar saati (HH:mm) ile UTC slot üretimi.
 * Türkiye sürekli UTC+3 kabul edilir (+03:00).
 */

export type GeneratedAvailabilitySlot = {
  starts_at: string;
  ends_at: string;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Takvim gününün haftanın günü (0=Pazar … 6=Cumartesi) — saf Gregoryen. */
export function civilWeekdaySun0(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return 0;
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

export function addDaysToYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function* iterateYmdInclusive(fromYmd: string, toYmd: string): Generator<string> {
  if (fromYmd > toYmd) return;
  let cur = fromYmd;
  while (cur <= toYmd) {
    yield cur;
    cur = addDaysToYmd(cur, 1);
  }
}

function parseIstanbulDayBoundaryMs(ymd: string, hhmm: string): number | null {
  if (!TIME_RE.test(hhmm)) return null;
  const ms = Date.parse(`${ymd}T${hhmm}:00+03:00`);
  return Number.isFinite(ms) ? ms : null;
}

export function generateAvailabilitySlots(input: {
  fromYmd: string;
  toYmd: string;
  weekdaysSun0: Set<number> | number[];
  dayStartHHmm: string;
  dayEndHHmm: string;
  sessionMinutes: number;
  breakMinutes: number;
  nowMs?: number;
  maxSlots?: number;
}): GeneratedAvailabilitySlot[] {
  const nowMs = input.nowMs ?? Date.now();
  const weekdays = input.weekdaysSun0 instanceof Set ? input.weekdaysSun0 : new Set(input.weekdaysSun0);
  const sessionMs = Math.floor(input.sessionMinutes) * 60_000;
  const breakMs = Math.floor(input.breakMinutes) * 60_000;
  const cap = input.maxSlots ?? 600;

  if (sessionMs < 15 * 60_000 || sessionMs > 3 * 60 * 60_000) return [];
  if (breakMs < 0 || breakMs > 2 * 60 * 60_000) return [];
  if (!TIME_RE.test(input.dayStartHHmm) || !TIME_RE.test(input.dayEndHHmm)) return [];

  const out: GeneratedAvailabilitySlot[] = [];

  for (const ymd of iterateYmdInclusive(input.fromYmd, input.toYmd)) {
    if (!weekdays.has(civilWeekdaySun0(ymd))) continue;

    const windowStartMs = parseIstanbulDayBoundaryMs(ymd, input.dayStartHHmm);
    const windowEndMs = parseIstanbulDayBoundaryMs(ymd, input.dayEndHHmm);
    if (windowStartMs === null || windowEndMs === null) continue;
    if (windowEndMs <= windowStartMs) continue;

    let cursor = windowStartMs;
    while (cursor + sessionMs <= windowEndMs) {
      const startMs = cursor;
      const endMs = cursor + sessionMs;
      if (startMs > nowMs) {
        out.push({
          starts_at: new Date(startMs).toISOString(),
          ends_at: new Date(endMs).toISOString(),
        });
        if (out.length >= cap) return out;
      }
      cursor = endMs + breakMs;
    }
  }

  return out;
}
