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
          ? "border-white/22 bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]"
          : "border-border/55 bg-white/[0.02] text-muted-foreground hover:border-border hover:bg-white/[0.04] hover:text-foreground",
        className,
      )}
    >
      {label}
    </motion.button>
  );
}
