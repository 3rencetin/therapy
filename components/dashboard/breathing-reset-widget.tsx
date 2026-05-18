"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";

export function BreathingResetWidget({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-[color-mix(in_oklch,var(--color-card),transparent_12%)] p-7 shadow-[var(--shadow-glass)] backdrop-blur-[16px]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(280px_circle_at_50%_0%,oklch(0.9_0.03_95/0.06),transparent_62%)]" />
      <div className="relative flex flex-col items-center text-center">
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">Mikro mola</p>
        <h3 className="mt-2 font-display text-xl tracking-[-0.02em]">Nefes reset</h3>
        <p className="mt-2 max-w-xs text-[0.82rem] leading-relaxed text-muted-foreground">
          Daireye odaklan—genişlerken nefes al, küçülürken ver. Kendi ritminde kal.
        </p>
        <div className="relative mt-8 flex h-40 w-full max-w-[13rem] items-center justify-center">
          <motion.div
            className="absolute rounded-full border border-white/10 bg-white/[0.03]"
            animate={{ scale: [1, 1.14, 1.14, 1], opacity: [0.5, 0.75, 0.75, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: premiumEase }}
            style={{ width: "7.5rem", height: "7.5rem" }}
          />
          <motion.div
            className="absolute rounded-full border border-white/[0.18] bg-gradient-to-br from-white/[0.1] to-white/[0.02]"
            animate={{ scale: [1, 1.08, 1.08, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: premiumEase }}
            style={{ width: "5.25rem", height: "5.25rem" }}
          />
          <span className="relative text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Yavaş</span>
        </div>
      </div>
    </div>
  );
}
