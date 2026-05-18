"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const KVKK_RIGHTS = [
  "trust.sectionKvkkR1",
  "trust.sectionKvkkR2",
  "trust.sectionKvkkR3",
  "trust.sectionKvkkR4",
  "trust.sectionKvkkR5",
] as const;

const toc = [
  { id: "veri", labelKey: "trust.tocData" },
  { id: "kvkk", labelKey: "trust.tocKvkk" },
  { id: "teknik", labelKey: "trust.tocTechnical" },
  { id: "terapistler", labelKey: "trust.tocTherapists" },
  { id: "acil", labelKey: "trust.tocCrisis" },
  { id: "kosullar", labelKey: "trust.tocTerms" },
  { id: "iletisim", labelKey: "trust.tocContact" },
] as const;

function TrustSection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28", className)}>
      <h2 className="font-display text-xl tracking-[-0.02em] text-foreground sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-3 text-[0.92rem] leading-[1.75] text-muted-foreground">{children}</div>
    </section>
  );
}

export function TrustCenterContent() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.16]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-white/[0.03] px-2.5 py-2 text-[0.78rem] text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:px-3"
            >
              <ArrowLeft className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
              <span className="hidden sm:inline">{t("trust.backLogin")}</span>
            </Link>
            <Link href="/" className="truncate font-display text-[1.05rem] tracking-[-0.02em] hover:opacity-90 sm:text-[1.1rem]">
              {siteConfig.name}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 pb-20 sm:px-6 sm:py-14">
        <div className="mb-10 flex flex-wrap items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border/55 bg-card/50 text-muted-foreground shadow-[var(--shadow-glass)]">
            <Shield className="size-6 stroke-[1.3]" />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/90 uppercase">{t("trust.kicker")}</p>
            <h1 className="font-display text-balance text-[clamp(1.65rem,4vw,2.25rem)] tracking-[-0.02em]">{t("trust.pageTitle")}</h1>
            <p className="max-w-3xl text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">{t("trust.pageIntro")}</p>
            <p className="text-[0.72rem] leading-relaxed text-muted-foreground/75">{t("trust.lastUpdated")}</p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-14">
          <nav
            aria-label={t("trust.tocTitle")}
            className="lg:sticky lg:top-24 lg:self-start lg:border-r lg:border-border/35 lg:pr-6"
          >
            <p className="mb-3 text-[0.72rem] font-medium tracking-[0.12em] text-muted-foreground/90 uppercase">{t("trust.tocTitle")}</p>
            <ul className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block whitespace-nowrap rounded-lg px-2 py-2 text-[0.82rem] text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground lg:whitespace-normal"
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="mt-6 hidden text-[0.8rem] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:inline"
            >
              {t("trust.backHome")}
            </Link>
          </nav>

          <div className="space-y-14">
            <TrustSection id="veri" title={t("trust.sectionDataTitle")}>
              <p>{t("trust.sectionDataP1")}</p>
              <p>{t("trust.sectionDataP2")}</p>
              <p>{t("trust.sectionDataP3")}</p>
            </TrustSection>

            <TrustSection id="kvkk" title={t("trust.sectionKvkkTitle")}>
              <p>{t("trust.sectionKvkkP1")}</p>
              <p>{t("trust.sectionKvkkP2")}</p>
              <p className="font-medium text-foreground/90">{t("trust.sectionKvkkRightsTitle")}</p>
              <ul className="list-inside list-disc space-y-2 pl-1">
                {KVKK_RIGHTS.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </TrustSection>

            <TrustSection id="teknik" title={t("trust.sectionTechnicalTitle")}>
              <p>{t("trust.sectionTechnicalP1")}</p>
              <p>{t("trust.sectionTechnicalP2")}</p>
            </TrustSection>

            <TrustSection id="terapistler" title={t("trust.sectionTherapistsTitle")}>
              <p>{t("trust.sectionTherapistsP1")}</p>
              <p>{t("trust.sectionTherapistsP2")}</p>
            </TrustSection>

            <TrustSection id="acil" title={t("trust.sectionCrisisTitle")} className="rounded-[var(--radius-xl)] border border-amber-500/20 bg-amber-500/[0.06] p-5 sm:p-6">
              <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-background/40 px-4 py-3 text-[0.88rem] text-foreground/95">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600/90 dark:text-amber-400/90" strokeWidth={1.5} />
                <p className="leading-relaxed">{t("trust.sectionCrisisAlert")}</p>
              </div>
              <p>{t("trust.sectionCrisisP1")}</p>
              <p>{t("trust.sectionCrisisP2")}</p>
            </TrustSection>

            <TrustSection id="kosullar" title={t("trust.sectionTermsTitle")}>
              <p>{t("trust.sectionTermsP1")}</p>
              <p>{t("trust.sectionTermsP2")}</p>
              <p>{t("trust.sectionTermsP3")}</p>
            </TrustSection>

            <TrustSection id="iletisim" title={t("trust.sectionContactTitle")}>
              <p>{t("trust.sectionContactP1")}</p>
              <p>{t("trust.sectionContactP2")}</p>
            </TrustSection>

            <footer className="border-t border-border/40 pt-8 text-[0.78rem] leading-relaxed text-muted-foreground/85">
              {t("trust.footerLegal")}
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
