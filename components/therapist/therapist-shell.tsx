"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, HeartHandshake, Home, Leaf, Stethoscope, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

import type { TherapistProfileRow } from "@/types/database";
import { siteConfig } from "@/config/site";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useI18n } from "@/components/i18n/i18n-provider";
import { premiumEase } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";

const nav: { href: string; labelKey: string; icon: typeof Home }[] = [
  { href: "/therapist", labelKey: "therapist.nav.home", icon: Home },
  { href: "/therapist/sessions", labelKey: "therapist.nav.sessions", icon: Calendar },
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

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.2]" />
        <motion.div
          className="absolute -left-[8%] bottom-[18%] size-[420px] rounded-full bg-[radial-gradient(circle_at_45%_50%,oklch(0.55_0.06_160/0.12),transparent_70%)] blur-3xl"
          animate={{ opacity: [0.32, 0.48, 0.32], y: [0, -8, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: premiumEase }}
        />
      </div>
      <div className="relative z-10 flex min-h-dvh">
        <aside className="hidden w-[16rem] shrink-0 border-r border-border/40 bg-background/38 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-border/35 px-4">
            <span className="grid size-9 place-items-center rounded-lg border border-border/50 bg-white/[0.03]">
              <Stethoscope className="size-[1.05rem] text-muted-foreground" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[0.92rem] tracking-[-0.02em]">{t("therapist.shell.therapist")}</p>
              <p className="truncate text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{siteConfig.name}</p>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-4">
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
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.88rem] transition-colors duration-200",
                    active
                      ? "bg-white/[0.07] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0 opacity-85" strokeWidth={1.45} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border/40 p-3">
            <p className="mb-2 truncate px-2 text-[0.78rem] text-muted-foreground">{displayName}</p>
            <SignOutButton className="w-full justify-center border border-border/50 bg-transparent hover:bg-white/[0.04]" />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/40 bg-background/55 px-4 py-4 backdrop-blur-xl sm:px-6">
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
                <ThemeToggle className="self-end" />
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
    </div>
  );
}
