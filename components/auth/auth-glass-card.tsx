"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { premiumEase, scaleIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

import { AuthModeToggle, type AuthMode } from "./auth-mode-toggle";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthGlassCard({
  mode,
  onModeChange,
  notice,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  notice?: string | null;
}) {
  const { t, locale } = useI18n();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={scaleIn}
      className="mx-auto w-full max-w-[420px]"
    >
      <div className="surface-premium overflow-hidden rounded-[1.35rem]">
        <div className="border-b border-border/50 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--apple-tint-sky)_40%,white),transparent)] px-6 py-6 sm:px-8">
          <div className="space-y-3">
            <p className="text-[0.72rem] font-semibold tracking-[0.12em] text-[#007AFF] uppercase">
              {mode === "login" ? t("auth.glass.welcomeBack") : t("auth.glass.createAccount")}
            </p>
            <h2 className="font-display text-[1.55rem] tracking-[-0.03em] text-foreground">
              {mode === "login" ? t("auth.modeToggle.loginTab") : t("auth.modeToggle.registerTab")}
            </h2>
            <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
              {mode === "login" ? t("auth.glass.loginIntro") : t("auth.glass.registerIntro")}
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-border/55 bg-card/80 px-3 py-1.5 text-[0.72rem] font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-[#007AFF]" strokeWidth={2} aria-hidden />
              {t("auth.glass.secureSession")}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {notice ? (
            <div
              className="mb-5 rounded-xl border border-[#FF3B30]/25 bg-[#FF3B30]/[0.06] px-3.5 py-3 text-[0.85rem] leading-relaxed text-[#C41E12]"
              role="alert"
            >
              {notice}
            </div>
          ) : null}

          <AuthModeToggle mode={mode} onChange={onModeChange} />

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: premiumEase }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: premiumEase }}
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className={cn("mt-7 text-center text-[0.7rem] leading-relaxed text-muted-foreground/85")}>
            {locale === "tr" ? t("auth.glass.footerPrefixTr") : t("auth.glass.footerPrefixEn")}
            <Link
              href={t("auth.glass.termsHref")}
              className="font-medium text-foreground/90 underline-offset-4 hover:text-[#007AFF] hover:underline"
            >
              {t("auth.glass.terms")}
            </Link>
            {locale === "tr" ? t("auth.glass.footerMiddleTr") : t("auth.glass.footerMiddleEn")}
            <Link
              href={t("auth.glass.privacyHref")}
              className="font-medium text-foreground/90 underline-offset-4 hover:text-[#007AFF] hover:underline"
            >
              {t("auth.glass.privacy")}
            </Link>
            {locale === "tr" ? t("auth.glass.footerSuffixTr") : t("auth.glass.footerSuffixEn")}
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-[0.72rem] text-muted-foreground/70 lg:hidden">
        {siteConfig.name} · {siteConfig.headline.kicker}
      </p>
    </motion.div>
  );
}
