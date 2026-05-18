"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { premiumEase } from "@/lib/animations/easing";

import { DashboardLiveClock } from "./dashboard-live-clock";
import { DashboardSidebarNav } from "./dashboard-sidebar-nav";
import { SignOutButton } from "./sign-out-button";

export function DashboardShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = displayName.split(/\s+/)[0] ?? displayName;

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.22]" />
        <motion.div
          className="absolute -left-[15%] top-[20%] size-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,oklch(0.52_0.07_255/0.12),transparent_68%)] blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, 12, 0], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 22, repeat: Infinity, ease: premiumEase }}
        />
        <motion.div
          className="absolute -right-[5%] bottom-[15%] size-[480px] rounded-full bg-[radial-gradient(circle_at_55%_45%,oklch(0.58_0.05_150/0.08),transparent_70%)] blur-3xl"
          animate={{ x: [0, -14, 0], opacity: [0.28, 0.42, 0.28] }}
          transition={{ duration: 26, repeat: Infinity, ease: premiumEase }}
        />
      </div>

      <div className="relative z-10 flex min-h-dvh">
        <aside className="hidden w-[clamp(15rem,18vw,17.5rem)] shrink-0 border-r border-border/40 bg-background/35 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-14 items-center border-b border-border/35 px-5">
            <Link href="/dashboard" className="font-display text-[1.05rem] tracking-[-0.02em]">
              {siteConfig.name}
            </Link>
          </div>
          <DashboardSidebarNav onNavigate={() => {}} className="flex-1 px-3 py-6" />
          <div className="border-t border-border/35 p-4">
            <p className="mb-3 truncate px-2 text-[0.78rem] text-muted-foreground">
              {t("dashboard.shell.helloName", { name: displayName })}
            </p>
            <SignOutButton className="w-full justify-center" />
          </div>
        </aside>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: premiumEase }}
              className="fixed inset-0 z-40 bg-background/72 backdrop-blur-md lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.aside
                initial={{ x: "-104%" }}
                animate={{ x: 0 }}
                exit={{ x: "-104%" }}
                transition={{ duration: 0.38, ease: premiumEase }}
                className="flex h-dvh w-[min(20rem,88vw)] flex-col border-r border-border/45 bg-[color-mix(in_oklch,var(--color-background),transparent_8%)] shadow-[var(--shadow-glass)] backdrop-blur-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex h-14 items-center justify-between border-b border-border/35 px-4">
                  <span className="font-display text-[1.05rem]">{siteConfig.name}</span>
                  <button
                    type="button"
                    aria-label={t("dashboard.shell.closeMenu")}
                    onClick={() => setMobileOpen(false)}
                    className="grid size-10 place-items-center rounded-lg border border-border/55 bg-white/[0.03] text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <DashboardSidebarNav
                  onNavigate={() => setMobileOpen(false)}
                  className="flex-1 overflow-y-auto px-3 py-6"
                />
                <div className="border-t border-border/35 p-4">
                  <SignOutButton className="w-full justify-center" />
                </div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border/40 bg-background/55 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid size-10 place-items-center rounded-lg border border-border/55 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground lg:hidden"
                aria-label={t("dashboard.shell.openMenu")}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                  <DashboardLiveClock className="sm:max-w-[min(22rem,46vw)]" />
                  <p className="font-display text-[1.05rem] leading-snug tracking-[-0.02em] sm:text-[1.125rem]">
                    {t("dashboard.shell.welcome", { name: firstName })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <div className="hidden sm:block">
                <div className="rounded-lg border border-border/50 bg-white/[0.03] px-3 py-2 text-[0.78rem] text-muted-foreground/80">
                  {t("dashboard.shell.calmBanner")}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
