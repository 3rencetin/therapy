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
      <div className="flex min-h-[280px] flex-col border-b border-border/50 lg:min-h-dvh lg:border-b-0 lg:border-r lg:border-border/45">
        <AuthBrandPanel />
      </div>

      <div className="relative flex flex-col">
        <header className="flex shrink-0 items-center justify-end gap-3 px-6 pt-5 sm:px-10 lg:px-12 lg:pt-8">
          <LanguageSwitcher />
        </header>
        <div className="flex flex-1 flex-col justify-center px-6 pb-10 pt-4 sm:px-10 lg:px-12 lg:pb-14">
          <AuthGlassCard mode={mode} onModeChange={setMode} notice={notice} />
        </div>
      </div>
    </AuthShell>
  );
}
