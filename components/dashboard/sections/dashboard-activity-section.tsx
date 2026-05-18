"use client";

import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

import type { ActivityEntry } from "@/lib/dashboard/activity-timeline";
import { useI18n } from "@/components/i18n/i18n-provider";
import { intlLocaleForApp } from "@/lib/i18n/locale";
import { fadeUp } from "@/lib/animations";

function formatWhen(iso: string, localeTag: string) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString(localeTag, { day: "numeric", month: "short" }) +
      " · " +
      d.toLocaleTimeString(localeTag, { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "";
  }
}

export function DashboardActivitySection({ entries }: { entries: ActivityEntry[] }) {
  const { t, locale } = useI18n();
  const localeTag = intlLocaleForApp(locale);
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-6 backdrop-blur-[12px]"
    >
      <div className="mb-6 flex items-center gap-2">
        <Sparkle className="size-4 text-muted-foreground/80" strokeWidth={1.5} />
        <h3 className="font-display text-lg tracking-[-0.02em]">{t("dashboard.sections.activityHeading")}</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("dashboard.sections.activityEmpty")}</p>
      ) : (
        <ul className="relative ms-1 space-y-6 border-l border-border/45 pl-6">
          {entries.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[calc(0.25rem+1px)] top-2 size-2 rounded-full bg-white/35 ring-4 ring-[color-mix(in_oklch,var(--color-background),transparent_4%)]" />
              <p className="text-[0.72rem] tracking-wide text-muted-foreground/75">{formatWhen(e.at, localeTag)}</p>
              <p className="mt-1 font-medium text-[0.9rem] text-foreground">{e.title}</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">{e.description}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
