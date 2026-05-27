"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, Compass, Home, Shield, Sparkles, Users } from "lucide-react";

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
      href: "/dashboard/rehber",
      labelKey: "dashboard.nav.guide",
      icon: <BookOpen className="size-[1.1rem] stroke-[1.5]" />,
      isActive: (p) => p.startsWith("/dashboard/rehber"),
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
              "group flex items-center gap-3 rounded-[0.75rem] px-3 py-2.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-all duration-300",
              active
                ? "bg-[#007AFF22] text-[#0070E8] shadow-[inset_0_0_0_1px_rgba(0,122,255,0.18)]"
                : "text-muted-foreground hover:bg-[#007AFF10] hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300",
                active ? "text-[#0070E8]" : "text-muted-foreground group-hover:text-foreground",
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
