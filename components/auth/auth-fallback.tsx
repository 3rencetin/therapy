"use client";

import { motion } from "framer-motion";

import { premiumEase } from "@/lib/animations/easing";

export function AuthFallback() {
  return (
    <div className="auth-page min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh max-w-[1380px] lg:grid-cols-2">
        <div className="space-y-6 border-b border-border/50 px-8 py-14 lg:border-b-0 lg:border-r lg:border-border/45">
          <div className="h-11 w-11 rounded-2xl bg-muted" />
          <div className="h-4 w-48 rounded-lg bg-muted" />
          <div className="h-10 w-full max-w-md rounded-lg bg-muted/80" />
          <div className="h-10 w-full max-w-sm rounded-lg bg-muted/80" />
        </div>
        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: premiumEase }}
            className="h-[380px] w-full max-w-[420px] rounded-[1.35rem] border border-border/60 bg-card/80"
          />
        </div>
      </div>
    </div>
  );
}
