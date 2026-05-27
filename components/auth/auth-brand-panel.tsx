"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, HeartHandshake, Lock, Shield } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { containerRise, fadeUp, premiumEase } from "@/lib/animations";

import { AmbientBackdrop } from "./ambient-backdrop";

const trustIcons = [Lock, Shield, BadgeCheck] as const;

export function AuthBrandPanel() {
  const { t } = useI18n();

  return (
    <div className="relative isolate flex h-full flex-col justify-between overflow-hidden px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <AmbientBackdrop />

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <motion.div initial="hidden" animate="show" variants={containerRise} className="space-y-8">
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#007AFF14] text-[#007AFF] shadow-[inset_0_0_0_0.5px_rgba(0,122,255,0.18)]">
              <HeartHandshake className="size-5" strokeWidth={1.6} />
            </span>
            <div>
              <p className="font-display text-[1.35rem] tracking-[-0.03em] text-foreground">{siteConfig.name}</p>
              <p className="text-[0.72rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {siteConfig.headline.kicker}
              </p>
            </div>
          </motion.div>

          <div className="space-y-3">
            {siteConfig.headline.lines.map((line, i) => (
              <motion.h1
                key={line}
                variants={fadeUp}
                className="font-display text-balance text-[clamp(1.85rem,3.8vw,2.75rem)] leading-[1.08] tracking-[-0.03em] text-foreground"
                style={{ opacity: 1 - i * 0.08 }}
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p variants={fadeUp} className="max-w-md text-pretty text-[0.98rem] leading-[1.7] text-muted-foreground">
            {siteConfig.description}
          </motion.p>

          <motion.ul variants={fadeUp} className="max-w-md space-y-3 pt-1">
            {siteConfig.trustPoints.map((item, idx) => {
              const Icon = trustIcons[idx] ?? Shield;
              return (
                <li
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-border/55 bg-card/70 px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm"
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[#007AFF10] text-[#007AFF]">
                    <Icon className="size-4" strokeWidth={1.55} />
                  </span>
                  <span className="min-w-0 space-y-0.5">
                    <span className="block text-[0.875rem] font-semibold tracking-[-0.01em] text-foreground">
                      {item.label}
                    </span>
                    <span className="block text-[0.8rem] leading-snug text-muted-foreground">{item.detail}</span>
                  </span>
                </li>
              );
            })}
          </motion.ul>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: premiumEase }}
        className="relative z-10 mt-8 text-[0.72rem] leading-relaxed text-muted-foreground/80 lg:mt-10"
      >
        {t("auth.brandDisclaimer")}{" "}
        <Link href="/guven" className="font-medium text-[#007AFF] underline-offset-4 hover:underline">
          {t("auth.trustCenterLink")}
        </Link>
      </motion.p>
    </div>
  );
}
