"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { GoogleAuthButton } from "./google-auth-button";

export function LoginForm() {
  const { t } = useI18n();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    setMessage(t("auth.login.signedIn"));
    window.location.assign("/dashboard");
  }

  async function onForgot(e: React.MouseEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError(t("auth.login.needEmailForReset"));
      return;
    }
    setResetting(true);
    setError(null);
    setMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setResetting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage(t("auth.login.resetSent"));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="login-email">{t("auth.login.email")}</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.login.emailPlaceholder")}
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="login-password">{t("auth.login.password")}</Label>
          <button
            type="button"
            onClick={onForgot}
            disabled={resetting}
            className="text-[0.8125rem] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-45"
          >
            {t("auth.login.forgot")}
          </button>
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          minLength={8}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem] text-muted-foreground select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(ev) => setRemember(ev.target.checked)}
          className="size-4 rounded border border-border/80 bg-input accent-[oklch(0.86_0.05_95)]"
        />
        {t("auth.login.rememberDevice")}
      </label>

      {error ? <p className="text-[0.85rem] leading-relaxed text-[oklch(0.78_0.12_22)]">{error}</p> : null}
      {message ? <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{message}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t("auth.login.signingIn")}
          </span>
        ) : (
          t("auth.login.continueSubmit")
        )}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/70" />
        <span className="relative mx-auto block w-fit bg-[color-mix(in_oklch,var(--color-card),transparent_22%)] px-3 text-center text-[0.75rem] tracking-wide text-muted-foreground/80 uppercase">
          {t("auth.login.separator")}
        </span>
      </div>

      <GoogleAuthButton />
    </form>
  );
}
