"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { siteConfig } from "@/config/site";
import { premiumEase, scaleIn } from "@/lib/animations";

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
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--gx", `${x}%`);
    el.style.setProperty("--gy", `${y}%`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--gx", "38%");
    el.style.setProperty("--gy", "22%");
  }, []);

  return (
    <div className="relative z-10 flex items-stretch px-6 pb-14 pt-10 sm:px-10 lg:px-12 lg:py-16">
      <motion.div
        initial="hidden"
        animate="show"
        variants={scaleIn}
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={
          {
            "--gx": "38%",
            "--gy": "22%",
          } as CSSProperties
        }
        className="relative w-full max-w-md self-center rounded-[var(--radius-xl)] border border-border/70 bg-[color-mix(in_oklch,var(--color-card),transparent_35%)] p-[1px] shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)] lg:max-w-lg"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius-xl)-1px)] opacity-80">
          <div
            className="absolute inset-0 rounded-[inherit]"
            style={{
              background:
                "radial-gradient(780px circle at var(--gx) var(--gy), oklch(0.92 0.04 95 / 0.09), transparent 62%)",
            }}
          />
          <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(145deg,oklch(1_0_0/0.05),transparent_42%)]" />
        </div>

        <div className="relative rounded-[calc(var(--radius-xl)-1px)] bg-[color-mix(in_oklch,var(--color-card),transparent_12%)] px-6 py-7 sm:px-8 sm:py-8">
          <header className="space-y-2 pb-7">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-display text-[1.35rem] tracking-[-0.02em] text-foreground">{siteConfig.name}</span>
              <span className="text-[0.72rem] tracking-[0.18em] text-muted-foreground/80 uppercase">{t("common.beta")}</span>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-muted-foreground">
              {mode === "login" ? t("auth.glass.loginIntro") : t("auth.glass.registerIntro")}
            </p>
          </header>

          {notice ? (
            <div className="mb-6 rounded-lg border border-border/60 bg-white/[0.03] px-3.5 py-3 text-[0.85rem] leading-relaxed text-muted-foreground">
              {notice}
            </div>
          ) : null}

          <div className="space-y-7">
            <AuthModeToggle mode={mode} onChange={onModeChange} />

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: premiumEase }}
                >
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: premiumEase }}
                >
                  <RegisterForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="pt-8 text-[0.72rem] leading-relaxed text-muted-foreground/75">
            {locale === "tr" ? (
              <>
                Devam ederek{" "}
                <a className="underline-offset-4 hover:text-foreground hover:underline" href="#">
                  {t("auth.glass.terms")}
                </a>
                &apos;nı ve{" "}
                <a className="underline-offset-4 hover:text-foreground hover:underline" href="#">
                  {t("auth.glass.privacy")}
                </a>
                &apos;ni kabul etmiş olursunuz.
              </>
            ) : (
              <>
                By continuing you agree to the{" "}
                <a className="underline-offset-4 hover:text-foreground hover:underline" href="#">
                  {t("auth.glass.terms")}
                </a>{" "}
                and the{" "}
                <a className="underline-offset-4 hover:text-foreground hover:underline" href="#">
                  {t("auth.glass.privacy")}
                </a>
                .
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
