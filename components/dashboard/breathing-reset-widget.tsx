"use client";

import { useLayoutEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { premiumEase } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";

const PHASE_MS = 4000;
const CYCLE_MS = PHASE_MS * 4;

const PHASE_KEYS = [
  "dashboard.sections.breathPhaseInhale",
  "dashboard.sections.breathPhaseHoldIn",
  "dashboard.sections.breathPhaseExhale",
  "dashboard.sections.breathPhaseHoldOut",
] as const;

export function BreathingResetWidget({ className }: { className?: string }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const prefersReduced = reduceMotion === true;
  const [phaseIdx, setPhaseIdx] = useState(0);

  useLayoutEffect(() => {
    if (prefersReduced) return;
    setPhaseIdx(0);
    const id = window.setInterval(() => {
      setPhaseIdx((i) => (i + 1) % 4);
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  return (
    <div
      className={cn(
        "relative overflow-hidden surface-premium rounded-[var(--radius-xl)] p-7 backdrop-blur-[18px]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(380px_circle_at_50%_0%,#007AFF20,transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,#5856D614,transparent_70%)]" />

      <div className="relative flex flex-col items-center text-center">
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/90 uppercase">
          {t("dashboard.sections.breathKicker")}
        </p>
        <h3 className="mt-2 font-display text-xl tracking-[-0.02em]">{t("dashboard.sections.breathTitle")}</h3>
        <p className="mt-2 max-w-[19rem] text-[0.82rem] leading-relaxed text-muted-foreground">
          {t("dashboard.sections.breathBody")}
        </p>
        <p className="mt-3 text-[0.68rem] tabular-nums tracking-[0.08em] text-muted-foreground/75 uppercase">
          {t("dashboard.sections.breathRhythmHint")}
        </p>

        <div className="relative mt-9 flex h-44 w-full max-w-[15rem] items-center justify-center">
          <motion.div
            className="absolute rounded-full border border-primary/15 bg-primary/[0.04] dark:border-white/[0.12] dark:bg-white/[0.03]"
            animate={
              prefersReduced
                ? { scale: 1, opacity: 0.45 }
                : {
                    scale: [1, 1.26, 1.26, 1, 1],
                    opacity: [0.38, 0.62, 0.62, 0.38, 0.38],
                  }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : {
                    duration: CYCLE_MS / 1000,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }
            }
            style={{ width: "8.25rem", height: "8.25rem" }}
          />
          <motion.div
            className="absolute rounded-full border border-border/60 bg-gradient-to-br from-foreground/[0.09] to-transparent dark:from-white/[0.14] dark:to-white/[0.02]"
            animate={
              prefersReduced
                ? { scale: 1, opacity: 0.78 }
                : {
                    scale: [1, 1.18, 1.18, 1, 1],
                    opacity: [0.65, 0.92, 0.92, 0.68, 0.65],
                  }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : {
                    duration: CYCLE_MS / 1000,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }
            }
            style={{ width: "6rem", height: "6rem" }}
          />
          <motion.div
            className="absolute rounded-full bg-gradient-to-b from-foreground/[0.12] to-foreground/[0.04] shadow-[inset_0_1px_0_oklch(1_0_0/0.2)] dark:from-white/18 dark:to-white/[0.05]"
            animate={
              prefersReduced
                ? { scale: 1 }
                : {
                    scale: [1, 1.12, 1.12, 1, 1],
                  }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : {
                    duration: CYCLE_MS / 1000,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }
            }
            style={{ width: "4.35rem", height: "4.35rem" }}
          />

          <motion.span
            key={prefersReduced ? "static" : PHASE_KEYS[phaseIdx]}
            initial={prefersReduced ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.45, ease: premiumEase }}
            className="relative z-[1] max-w-[7rem] text-center text-[0.7rem] font-semibold tracking-[0.18em] text-foreground uppercase"
          >
            {prefersReduced ? t("dashboard.sections.breathPhaseInhale") : t(PHASE_KEYS[phaseIdx])}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
