"use client";

import { motion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "register";

export function AuthModeToggle({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  const { t } = useI18n();

  const modes: { id: AuthMode; label: string }[] = [
    { id: "login", label: t("auth.modeToggle.loginTab") },
    { id: "register", label: t("auth.modeToggle.registerTab") },
  ];

  return (
    <div
      className="grid grid-cols-2 rounded-xl border border-border/60 bg-muted/50 p-1"
      role="tablist"
      aria-label={t("auth.modeToggle.title")}
    >
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={cn(
              "relative z-10 h-10 rounded-[0.65rem] text-[0.875rem] font-semibold tracking-[-0.01em] transition-colors duration-200",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/85",
            )}
          >
            {active ? (
              <motion.div
                layoutId="auth-mode-pill"
                className="absolute inset-0 rounded-[0.65rem] bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_0_0_0.5px_rgba(0,122,255,0.08)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
