import type { Metadata } from "next";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("accountBanned.metaTitle"),
    description: t("accountBanned.metaDescription"),
  };
}

export default async function HesapEngellendiPage() {
  const { t } = await getServerTranslator();
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="ambient-grid pointer-events-none fixed inset-0 opacity-[0.14]" />
      <div className="relative z-10 w-full max-w-md space-y-6 rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-8 shadow-[var(--shadow-glass)]">
        <div className="space-y-2 text-center">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("accountBanned.kicker")}
          </p>
          <h1 className="font-display text-[1.5rem] tracking-[-0.02em]">{t("accountBanned.title")}</h1>
          <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("accountBanned.body")}</p>
        </div>
        <SignOutButton className="w-full justify-center border border-border/55 bg-transparent hover:bg-white/[0.05]" />
      </div>
    </div>
  );
}
