"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DiscoveryChip({
  active,
  label,
  onClick,
  className,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[0.72rem] font-medium tracking-wide transition-colors duration-200 uppercase",
        active
          ? "border-[oklch(0.72_0.14_195/0.45)] bg-gradient-to-r from-[oklch(0.55_0.14_195/0.22)] to-[oklch(0.48_0.16_285/0.18)] text-foreground shadow-[0_4px_16px_-6px_oklch(0.45_0.14_195/0.4)]"
          : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-primary/25 hover:bg-white/[0.06] hover:text-foreground",
        className,
      )}
    >
      {label}
    </motion.button>
  );
}
