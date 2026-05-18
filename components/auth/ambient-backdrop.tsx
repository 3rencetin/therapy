"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="ambient-grid absolute inset-0 opacity-[0.35]" />
      <motion.div
        className="absolute -left-[18%] top-[8%] size-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,oklch(0.52_0.08_255/0.22),transparent_68%)] blur-3xl"
        animate={{ x: [0, 26, 0], y: [0, 18, 0], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 18, repeat: Infinity, ease: premiumEase }}
      />
      <motion.div
        className="absolute -right-[12%] bottom-[6%] size-[560px] rounded-full bg-[radial-gradient(circle_at_62%_40%,oklch(0.62_0.06_145/0.14),transparent_70%)] blur-3xl"
        animate={{ x: [0, -22, 0], y: [0, -14, 0], opacity: [0.4, 0.62, 0.4] }}
        transition={{ duration: 22, repeat: Infinity, ease: premiumEase }}
      />
      <motion.div
        className="absolute left-[35%] top-[42%] size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,oklch(0.78_0.04_95/0.08),transparent_62%)] blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: premiumEase }}
      />
    </div>
  );
}
