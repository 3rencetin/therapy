"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function AuthFallback() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="h-14 border-b border-border/50 bg-white/[0.02]" />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="h-4 w-44 rounded bg-white/[0.06]" />
          <div className="h-12 w-full max-w-md rounded bg-white/[0.05]" />
          <div className="h-12 w-full max-w-sm rounded bg-white/[0.05]" />
        </div>
        <motion.div
          initial={{ opacity: 0.35 }}
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: premiumEase }}
          className="h-[420px] rounded-2xl border border-border/60 bg-white/[0.02]"
        />
      </div>
    </div>
  );
}
