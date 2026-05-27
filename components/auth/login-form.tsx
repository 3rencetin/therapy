"use client";

import { useMemo, useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={onSubmit} className="space-y-5">
      <AuthField
        id="login-email"
        label={t("auth.login.email")}
        type="email"
        autoComplete="email"
        placeholder={t("auth.login.emailPlaceholder")}
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        required
        icon={<Mail className="size-4" strokeWidth={1.6} />}
      />

      <AuthField
        id="login-password"
        label={t("auth.login.password")}
        type="password"
        autoComplete="current-password"
        placeholder={t("auth.login.passwordPlaceholder")}
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
        required
        minLength={8}
        icon={<Lock className="size-4" strokeWidth={1.6} />}
        labelAction={
          <button
            type="button"
            onClick={onForgot}
            disabled={resetting}
            className="text-[0.78rem] font-medium text-[#007AFF] transition-opacity hover:underline disabled:opacity-45"
          >
            {t("auth.login.forgot")}
          </button>
        }
      />

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-[0.84rem] text-muted-foreground select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(ev) => setRemember(ev.target.checked)}
          className="size-4 rounded border-border accent-[#007AFF]"
        />
        {t("auth.login.rememberDevice")}
      </label>

      {error ? (
        <p className="rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/[0.06] px-3 py-2.5 text-[0.84rem] text-[#C41E12]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-[#34C759]/25 bg-[#34C759]/[0.08] px-3 py-2.5 text-[0.84rem] text-[#1B7A36]">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t("auth.login.signingIn")}
          </span>
        ) : (
          t("auth.login.continueSubmit")
        )}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border/70" />
        <span className="relative mx-auto block w-fit bg-card px-3 text-[0.72rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("auth.login.separator")}
        </span>
      </div>

      <GoogleAuthButton />
    </form>
  );
}
