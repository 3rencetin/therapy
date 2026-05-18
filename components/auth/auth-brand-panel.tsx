"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { containerRise, fadeUp, premiumEase } from "@/lib/animations";

import { AmbientBackdrop } from "./ambient-backdrop";
import { SoftParticles } from "./soft-particles";

const iconFor = (label: string) => {
  if (/şifreli|tls|bağlantı/i.test(label)) return ShieldCheck;
  if (/doğrulanmış|terapist/i.test(label)) return Sparkles;
  return ShieldCheck;
};

export function AuthBrandPanel() {
  const { t } = useI18n();
  return (
    <div className="relative isolate flex min-h-[320px] flex-col justify-between overflow-hidden px-8 py-12 sm:px-10 lg:min-h-0 lg:px-14 lg:py-16">
      <AmbientBackdrop />
      <SoftParticles />

      <div className="relative z-10 space-y-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerRise}
          className="space-y-7 lg:pt-1"
        >
          <motion.p variants={fadeUp} className="max-w-md text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">
            {siteConfig.headline.kicker}
          </motion.p>

          <div className="space-y-4">
            {siteConfig.headline.lines.map((line) => (
              <motion.h1
                key={line}
                variants={fadeUp}
                className="font-display text-balance text-[clamp(2.05rem,4.6vw,3.35rem)] leading-[1.05] tracking-[-0.02em] text-foreground"
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p variants={fadeUp} className="max-w-md text-pretty text-[1.02rem] leading-[1.65] text-muted-foreground">
            {siteConfig.description}
          </motion.p>
        </motion.div>

        <motion.ul
          initial="hidden"
          animate="show"
          transition={{ delay: 0.35, staggerChildren: 0.09 }}
          className="grid max-w-lg gap-3 sm:grid-cols-3"
        >
          {siteConfig.trustPoints.map((item) => {
            const Icon = iconFor(item.label);
            return (
              <motion.li
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: premiumEase } },
                }}
                className="rounded-xl border border-border/60 bg-white/[0.02] px-3.5 py-3 shadow-[0_1px_0_oklch(1_0_0/0.03)_inset] backdrop-blur-[var(--blur-glass)]"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-8 place-items-center rounded-md border border-border/60 bg-white/[0.03] text-foreground/80">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-[0.8125rem] font-medium leading-snug text-foreground">{item.label}</span>
                    <span className="block text-[0.72rem] leading-snug text-muted-foreground/90">{item.detail}</span>
                  </span>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.55, ease: premiumEase }}
        className="relative z-10 mt-14 max-w-md text-[0.72rem] leading-relaxed text-muted-foreground/75"
      >
        {t("auth.brandDisclaimer")}{" "}
        <Link href="/guven" className="text-foreground/90 underline-offset-4 hover:underline">
          {t("auth.trustCenterLink")}
        </Link>
      </motion.p>
    </div>
  );
}
