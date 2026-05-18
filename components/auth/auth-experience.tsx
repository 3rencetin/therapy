"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useI18n } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import type { AuthMode } from "./auth-mode-toggle";
import { AuthBrandPanel } from "./auth-brand-panel";
import { AuthGlassCard } from "./auth-glass-card";
import { AuthShell } from "./auth-shell";

function mapQueryError(code: string | null, t: (k: string) => string) {
  switch (code) {
    case "supabase_config":
      return t("auth.errors.config");
    case "oauth":
      return t("auth.errors.oauth");
    case "session":
      return t("auth.errors.session");
    default:
      return null;
  }
}

export function AuthExperience() {
  const { t } = useI18n();
  const params = useSearchParams();
  const notice = useMemo(() => mapQueryError(params.get("error"), t), [params, t]);
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <AuthShell>
      <div className="pointer-events-none absolute right-0 top-0 z-30 p-4 sm:p-6">
        <div className="pointer-events-auto">
          <LanguageSwitcher />
        </div>
      </div>
      <div className="border-b border-border/50 bg-background/40 lg:border-b-0 lg:border-r lg:border-border/45">
        <AuthBrandPanel />
      </div>
      <div className="relative bg-[radial-gradient(1200px_circle_at_50%_-10%,oklch(0.22_0.03_262/0.55),transparent_55%)]">
        <AuthGlassCard mode={mode} onModeChange={setMode} notice={notice} />
      </div>
    </AuthShell>
  );
}
