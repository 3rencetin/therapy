"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Compass, Home, Shield, Sparkles, Users } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

export function DashboardSidebarNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate: () => void;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  const items: {
    href: string;
    labelKey: string;
    icon: ReactNode;
    isActive: (pathname: string) => boolean;
  }[] = [
    {
      href: "/dashboard",
      labelKey: "dashboard.nav.home",
      icon: <Home className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p === "/dashboard",
    },
    {
      href: "/dashboard/therapists",
      labelKey: "dashboard.nav.therapists",
      icon: <Users className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p.startsWith("/dashboard/therapists"),
    },
    {
      href: "/onboarding",
      labelKey: "dashboard.nav.matching",
      icon: <Compass className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p === "/onboarding",
    },
    {
      href: "/dashboard/sessions",
      labelKey: "dashboard.nav.sessions",
      icon: <Calendar className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p.startsWith("/dashboard/sessions"),
    },
    {
      href: "/dashboard/journey",
      labelKey: "dashboard.nav.journey",
      icon: <Sparkles className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p.startsWith("/dashboard/journey"),
    },
    {
      href: "/guven",
      labelKey: "dashboard.nav.trust",
      icon: <Shield className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p === "/guven",
    },
  ];

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] transition-colors duration-200",
              active
                ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.05)]"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg border transition-colors duration-200",
                active ? "border-white/15 bg-white/[0.06] text-foreground" : "border-border/55 bg-white/[0.02] text-muted-foreground group-hover:border-border",
              )}
            >
              {item.icon}
            </span>
            <span className="flex flex-1 items-center justify-between gap-2">{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
