"use client";

import { motion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

export function AuthModeToggle({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  const { t } = useI18n();

  const modes: { id: AuthMode; label: string; hint: string }[] = [
    { id: "login", label: t("auth.modeToggle.loginTab"), hint: t("auth.modeToggle.loginHint") },
    { id: "register", label: t("auth.modeToggle.registerTab"), hint: t("auth.modeToggle.registerHint") },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.8125rem] text-muted-foreground">{t("auth.modeToggle.title")}</p>
        <span className="text-[0.72rem] text-muted-foreground/70">{modes.find((m) => m.id === mode)?.hint}</span>
      </div>
      <div className="relative grid grid-cols-2 rounded-xl border border-border/60 bg-white/[0.02] p-1 shadow-[0_1px_0_oklch(1_0_0/0.03)_inset]">
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={cn(
                "relative z-10 h-11 rounded-lg text-[0.9rem] font-medium transition-colors duration-200",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground/85",
              )}
            >
              {active ? (
                <motion.div
                  layoutId="auth-mode-pill"
                  className="absolute inset-0 rounded-lg bg-white/[0.065] shadow-[0_1px_0_oklch(1_0_0/0.04)_inset]"
                  transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.85 }}
                />
              ) : null}
              <span className="relative z-10">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
