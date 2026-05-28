"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, HeartHandshake, Home, Leaf, Stethoscope, UserCircle, Video } from "lucide-react";
import { motion } from "framer-motion";

import type { TherapistProfileRow } from "@/types/database";
import { siteConfig } from "@/config/site";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/i18n-provider";
import { premiumEase } from "@/lib/animations/easing";
import { isImmersiveVideoRoute } from "@/lib/navigation/is-immersive-video-route";
import { THERAPIST_SIDEBAR_WIDTH } from "@/lib/theme/constants";
import { cn } from "@/lib/utils";

const nav: { href: string; labelKey: string; icon: typeof Home }[] = [
  { href: "/therapist", labelKey: "therapist.nav.home", icon: Home },
  { href: "/therapist/sessions", labelKey: "therapist.nav.sessions", icon: Calendar },
  { href: "/therapist/office", labelKey: "therapist.nav.office", icon: Video },
  { href: "/therapist/availability", labelKey: "therapist.nav.availability", icon: Leaf },
  { href: "/therapist/profile", labelKey: "therapist.nav.profile", icon: UserCircle },
];

export function TherapistShell({
  displayName,
  staffProfile,
  children,
}: {
  displayName: string;
  staffProfile: TherapistProfileRow | null;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  if (isImmersiveVideoRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.14]" />
        <motion.div
          className="absolute -left-[8%] bottom-[18%] size-[420px] rounded-full bg-[radial-gradient(circle_at_45%_50%,#007AFF16,transparent_70%)] blur-3xl"
          animate={{ opacity: [0.32, 0.48, 0.32], y: [0, -8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: premiumEase }}
        />
      </div>

      <aside
        className="sidebar-surface fixed inset-y-0 left-0 z-40 hidden h-dvh flex-col border-r border-border shadow-[4px_0_32px_-16px_rgba(0,0,0,0.08)] lg:flex"
        style={{ width: THERAPIST_SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="grid size-9 place-items-center rounded-xl bg-[#007AFF14] text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.12)]">
            <Stethoscope className="size-[1.05rem]" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.92rem] tracking-[-0.02em]">{t("therapist.shell.therapist")}</p>
            <p className="truncate text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{siteConfig.name}</p>
          </div>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-4">
          {nav.map((item) => {
            const active =
              item.href === "/therapist"
                ? pathname === "/therapist"
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
                <item.icon className="size-4 shrink-0 opacity-85" strokeWidth={1.45} />
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

      <div className="relative z-10 flex min-h-dvh flex-col lg:pl-[16rem]">
        <header className="sticky top-0 z-20 border-b border-border bg-[color-mix(in_srgb,var(--apple-surface-elevated)_82%,transparent)] px-4 py-4 backdrop-blur-[var(--blur-glass)] sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.72rem] tracking-[0.12em] text-muted-foreground uppercase">
                {t("therapist.shell.headerLabel")}
              </p>
              <p className="font-display text-[1.15rem] tracking-[-0.02em]">
                {staffProfile?.full_name ?? t("therapist.shell.profileFallback")}
              </p>
            </div>
            <div className="flex min-w-0 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
              <LanguageSwitcher className="self-start sm:self-end" />
              {!staffProfile ? (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/18 bg-amber-500/[0.07] px-3 py-2 text-[0.78rem] text-amber-50/95">
                  <HeartHandshake className="mt-0.5 size-4 shrink-0" />
                  <p>{t("therapist.shell.unlinked")}</p>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-9">{children}</main>
      </div>
    </div>
  );
}
