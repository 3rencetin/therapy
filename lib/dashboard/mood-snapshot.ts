export type MoodMetricId = "balance" | "energy" | "connection";

export type MoodSnapshot = {
  id: MoodMetricId;
  value: number;
};

function splitMix(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const next = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) % 100;
  };
  return next;
}

export function moodSnapshotForUser(userId: string): MoodSnapshot[] {
  const next = splitMix(userId);
  const denge = 56 + (next() % 28);
  const enerji = 50 + (next() % 35);
  const bag = 58 + (next() % 30);

  return [
    { id: "balance", value: denge },
    { id: "energy", value: enerji },
    { id: "connection", value: bag },
  ];
}
