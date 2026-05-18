"use client";

import { motion } from "framer-motion";

import { softSpring } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";

export function SelectableFieldCard({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2, transition: softSpring }}
      whileTap={{ scale: 0.992 }}
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius-lg)] border px-4 py-3.5 text-left transition-colors duration-200",
        selected
          ? "border-white/[0.22] bg-white/[0.08] shadow-[0_1px_0_oklch(1_0_0/0.05)_inset,0_18px_40px_-36px_oklch(0_0_0/0.75)]"
          : "border-border/55 bg-white/[0.025] hover:border-border hover:bg-white/[0.045]",
      )}
    >
      {selected ? (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(280px_circle_at_20%_0%,oklch(0.93_0.03_95/0.06),transparent_62%)]" />
      ) : null}
      <span className="relative z-10 block text-[0.95rem] font-medium text-foreground">{label}</span>
      {hint ? (
        <span className="relative z-10 mt-1 block text-[0.78rem] leading-snug text-muted-foreground/85">{hint}</span>
      ) : null}
    </motion.button>
  );
}
