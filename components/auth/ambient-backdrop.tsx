"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-[15%] top-[5%] size-[480px] rounded-full bg-[radial-gradient(circle_at_40%_40%,#007AFF22,transparent_68%)] blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 14, 0], opacity: [0.5, 0.72, 0.5] }}
        transition={{ duration: 20, repeat: Infinity, ease: premiumEase }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[8%] size-[420px] rounded-full bg-[radial-gradient(circle_at_55%_45%,#5856D620,transparent_70%)] blur-3xl"
        animate={{ x: [0, -16, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 24, repeat: Infinity, ease: premiumEase }}
      />
    </div>
  );
}
