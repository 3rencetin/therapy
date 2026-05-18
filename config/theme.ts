export const spacing = {
  section: "clamp(2rem, 6vw, 5rem)",
  contentMax: "min(100% - 2.5rem, 72rem)",
  stack: "1.25rem",
  stackLoose: "1.75rem",
} as const;

export const radii = {
  card: "1.25rem",
  control: "0.875rem",
  pill: "9999px",
} as const;

export const motion = {
  duration: {
    fast: 0.18,
    base: 0.45,
    slow: 0.75,
  },
} as const;
