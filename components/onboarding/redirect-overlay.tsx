"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function RedirectOverlay({ open, title, subtitle }: { open: boolean; title: string; subtitle?: string }) {
  return (
    <motion.div
      aria-hidden={!open}
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/0 px-6 backdrop-blur-0"
      initial={false}
      animate={
        open
          ? { opacity: 1, backdropFilter: "blur(12px)", backgroundColor: "oklch(0.135 0.02 262 / 0.75)" }
          : { opacity: 0, backdropFilter: "blur(0px)", backgroundColor: "oklch(0.135 0.02 262 / 0)" }
      }
      transition={{ duration: 0.45, ease: premiumEase }}
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      <motion.div
        initial={false}
        animate={
          open
            ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.97, y: 12, filter: "blur(8px)" }
        }
        transition={{ duration: 0.5, ease: premiumEase }}
        className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border/60 bg-[color-mix(in_oklch,var(--color-card),transparent_18%)] p-8 text-center shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)]"
      >
        <motion.div
          className="mx-auto mb-5 size-10 rounded-full border-2 border-white/12 border-t-white/55"
          animate={open ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1.05, repeat: open ? Infinity : 0, ease: "linear" }}
        />
        <p className="font-display text-lg tracking-[-0.02em] text-foreground">{title}</p>
        {subtitle ? <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
      </motion.div>
    </motion.div>
  );
}
