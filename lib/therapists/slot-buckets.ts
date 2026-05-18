const BUCKET_ORDER = ["Sabah", "Öğleden sonra", "Akşam", "Gece geç"] as const;

export type AvailabilityBucket = (typeof BUCKET_ORDER)[number];

export const AVAILABILITY_BUCKET_LABELS: readonly AvailabilityBucket[] = BUCKET_ORDER;

function istanbulHour(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const hourRaw = parts.find((p) => p.type === "hour")?.value ?? "0";
  return Number.parseInt(hourRaw, 10);
}

export function availabilityBucketsForSlotStart(iso: string): AvailabilityBucket[] {
  const hour = istanbulHour(iso);
  const labels: AvailabilityBucket[] = [];
  const push = (label: AvailabilityBucket) => {
    if (!labels.includes(label)) labels.push(label);
  };
  if (hour >= 6 && hour < 12) push("Sabah");
  if (hour >= 12 && hour < 17) push("Öğleden sonra");
  if (hour >= 17 && hour < 21) push("Akşam");
  if (hour >= 21 || hour < 6) push("Gece geç");
  return labels.length ? labels : ["Öğleden sonra"];
}

export function orderAvailabilityBuckets(labels: string[]): string[] {
  const set = new Set(labels);
  const ordered: string[] = [];
  for (const b of BUCKET_ORDER) {
    if (set.has(b)) ordered.push(b);
  }
  for (const b of labels) {
    if (!ordered.includes(b)) ordered.push(b);
  }
  return ordered;
}
