"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { premiumEase } from "@/lib/animations/easing";
import { isImmersiveVideoRoute } from "@/lib/navigation/is-immersive-video-route";
import { DASHBOARD_SIDEBAR_WIDTH } from "@/lib/theme/constants";

import { DashboardSidebarNav } from "./dashboard-sidebar-nav";
import { SignOutButton } from "./sign-out-button";

function SidebarFooter({ displayName }: { displayName: string }) {
  const { t } = useI18n();
  return (
    <div className="shrink-0 border-t border-border p-4">
      <p className="mb-3 truncate px-2 text-[0.78rem] font-medium text-muted-foreground">
        {t("dashboard.shell.helloName", { name: displayName })}
      </p>
      <SignOutButton className="w-full justify-center border border-border bg-card/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:bg-muted" />
    </div>
  );
}

export function DashboardShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const firstName = displayName.split(/\s+/)[0] ?? displayName;

  if (isImmersiveVideoRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.2]" />
        <motion.div
          className="absolute -left-[12%] top-[18%] size-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,#007AFF28,transparent_68%)] blur-3xl"
          animate={{ x: [0, 18, 0], y: [0, 12, 0], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 22, repeat: Infinity, ease: premiumEase }}
        />
        <motion.div
          className="absolute -right-[5%] bottom-[12%] size-[480px] rounded-full bg-[radial-gradient(circle_at_55%_45%,#5856D626,transparent_70%)] blur-3xl"
          animate={{ x: [0, -14, 0], opacity: [0.25, 0.42, 0.25] }}
          transition={{ duration: 26, repeat: Infinity, ease: premiumEase }}
        />
      </div>

      <aside
        className="sidebar-surface fixed inset-y-0 left-0 z-40 hidden h-dvh flex-col border-r border-border shadow-[4px_0_32px_-16px_rgba(0,0,0,0.08)] lg:flex"
        style={{ width: DASHBOARD_SIDEBAR_WIDTH }}
      >
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          <Link href="/dashboard" className="group min-w-0">
            <span className="block font-display text-[1.15rem] tracking-[-0.025em] gradient-text-moon">{siteConfig.name}</span>
            <span className="mt-0.5 block text-[0.65rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              {t("dashboard.shell.sidebarTagline")}
            </span>
          </Link>
        </div>
        <DashboardSidebarNav onNavigate={() => {}} className="min-h-0 flex-1 overflow-y-auto px-3 py-5" />
        <SidebarFooter displayName={displayName} />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: premiumEase }}
            className="fixed inset-0 z-50 bg-[#1d1d1f]/20 backdrop-blur-md lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: "-104%" }}
              animate={{ x: 0 }}
              exit={{ x: "-104%" }}
              transition={{ duration: 0.38, ease: premiumEase }}
              className="sidebar-surface flex h-dvh w-[min(20rem,88vw)] flex-col border-r border-border shadow-[var(--shadow-glass)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="font-display text-[1.1rem] gradient-text-moon">{siteConfig.name}</span>
                <button
                  type="button"
                  aria-label={t("dashboard.shell.closeMenu")}
                  onClick={() => setMobileOpen(false)}
                  className="grid size-10 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              <DashboardSidebarNav
                onNavigate={() => setMobileOpen(false)}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-5"
              />
              <SidebarFooter displayName={displayName} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-dvh flex-col lg:pl-[clamp(15rem,18vw,17.5rem)]">
        <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-[color-mix(in_srgb,var(--apple-surface-elevated)_90%,transparent)] backdrop-blur-[var(--blur-glass)]">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:bg-muted hover:text-foreground lg:hidden"
                aria-label={t("dashboard.shell.openMenu")}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-display text-[1.15rem] leading-tight tracking-[-0.025em] sm:text-[1.3rem]">
                  {t("dashboard.shell.welcome", { name: firstName })}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-2 text-[0.76rem] font-medium text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34C759] opacity-40" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#34C759]" />
                </span>
                {t("dashboard.shell.calmBanner")}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
