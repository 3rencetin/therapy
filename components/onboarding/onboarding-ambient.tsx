"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function OnboardingAmbient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="ambient-grid absolute inset-0 opacity-[0.28]" />
      <motion.div
        className="absolute -left-[20%] top-[12%] size-[480px] rounded-full bg-[radial-gradient(circle_at_32%_38%,oklch(0.55_0.07_255/0.16),transparent_68%)] blur-3xl"
        animate={{ x: [0, 22, 0], y: [0, 16, 0], opacity: [0.45, 0.62, 0.45] }}
        transition={{ duration: 20, repeat: Infinity, ease: premiumEase }}
      />
      <motion.div
        className="absolute -right-[8%] bottom-[10%] size-[520px] rounded-full bg-[radial-gradient(circle_at_58%_42%,oklch(0.58_0.06_155/0.1),transparent_70%)] blur-3xl"
        animate={{ x: [0, -18, 0], y: [0, -12, 0], opacity: [0.32, 0.48, 0.32] }}
        transition={{ duration: 24, repeat: Infinity, ease: premiumEase }}
      />
    </div>
  );
}
