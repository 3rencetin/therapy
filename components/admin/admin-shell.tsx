"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  LayoutDashboard,
  Menu,
  Radio,
  Shield,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { premiumEase } from "@/lib/animations/easing";
import { isImmersiveVideoRoute } from "@/lib/navigation/is-immersive-video-route";
import { ADMIN_SIDEBAR_WIDTH } from "@/lib/theme/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  Users,
  Stethoscope,
  Activity,
  Radio,
  Shield,
  BookOpen,
} as const;

type NavKey = keyof typeof iconMap;

const navKeys: { href: string; labelKey: string; icon: NavKey }[] = [
  { href: "/admin", labelKey: "admin.shell.overview", icon: "LayoutDashboard" },
  { href: "/admin/users", labelKey: "admin.shell.users", icon: "Users" },
  { href: "/admin/therapists", labelKey: "admin.shell.therapists", icon: "Stethoscope" },
  { href: "/admin/sessions", labelKey: "admin.shell.sessions", icon: "Activity" },
  { href: "/admin/rooms", labelKey: "admin.shell.rooms", icon: "Radio" },
  { href: "/admin/reports", labelKey: "admin.shell.reports", icon: "Shield" },
  { href: "/admin/rehber", labelKey: "admin.shell.guide", icon: "BookOpen" },
];

export function AdminShell({ displayName, children }: { displayName: string; children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isImmersiveVideoRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.14]" />
        <motion.div
          className="absolute -right-[10%] top-[10%] size-[380px] rounded-full bg-[radial-gradient(circle_at_50%_50%,#5856D616,transparent_68%)] blur-3xl"
          animate={{ opacity: [0.25, 0.4, 0.25], x: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: premiumEase }}
        />
      </div>

      <aside
        className="sidebar-surface fixed inset-y-0 left-0 z-40 hidden h-dvh flex-col border-r border-border shadow-[4px_0_32px_-16px_rgba(0,0,0,0.08)] lg:flex"
        style={{ width: ADMIN_SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="grid size-9 place-items-center rounded-xl bg-[#007AFF14] text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.12)]">
            <Shield className="size-[1.05rem]" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.95rem] tracking-[-0.02em]">{siteConfig.name}</p>
            <p className="truncate text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("admin.shell.internalPanel")}
            </p>
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-4">
          {navKeys.map((item) => {
            const Icon = iconMap[item.icon];
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-[0.75rem] px-3 py-2 text-[0.875rem] font-medium tracking-[-0.01em] transition-all duration-300",
                  active
                    ? "bg-[#007AFF14] text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.12)]"
                    : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0 opacity-80" strokeWidth={1.5} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-border p-3">
          <p className="mb-2 truncate px-2 text-[0.78rem] text-muted-foreground">{displayName}</p>
          <SignOutButton className="w-full justify-center border border-border bg-card/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:bg-muted" />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="admin-drawer"
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
              style={{ width: ADMIN_SIDEBAR_WIDTH }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <span className="font-display text-[0.95rem] tracking-[-0.02em]">{siteConfig.name}</span>
                <button
                  type="button"
                  aria-label={t("dashboard.shell.closeMenu")}
                  onClick={() => setMobileOpen(false)}
                  className="grid size-10 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-4">
                {navKeys.map((item) => {
                  const Icon = iconMap[item.icon];
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[0.75rem] px-3 py-2 text-[0.875rem] font-medium",
                        active ? "bg-[#007AFF14] text-[#007AFF]" : "text-muted-foreground hover:bg-black/[0.04]",
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </nav>
              <div className="shrink-0 space-y-3 border-t border-border p-3">
                <LanguageSwitcher className="w-full justify-center" />
                <p className="truncate px-2 text-[0.78rem] text-muted-foreground">{displayName}</p>
                <SignOutButton className="w-full justify-center border border-border bg-card/90 hover:bg-muted" />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-dvh flex-col lg:pl-[15.5rem]">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/45 bg-[color-mix(in_srgb,var(--color-background),transparent_12%)] px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card/90 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label={t("dashboard.shell.openMenu")}
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <p className="truncate text-[0.72rem] tracking-[0.12em] text-muted-foreground uppercase">
              {t("admin.shell.management")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <p className="hidden text-[0.72rem] text-muted-foreground/80 sm:block">{t("admin.shell.auditHint")}</p>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-7 sm:py-9">{children}</main>
      </div>
    </div>
  );
}
