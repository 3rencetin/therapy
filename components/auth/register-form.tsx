"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/field-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { GoogleAuthButton } from "./google-auth-button";

export function RegisterForm() {
  const { t } = useI18n();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirm) {
      setError(t("auth.register.mismatch"));
      return;
    }

    setLoading(true);

    const { error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signError) {
      setError(signError.message);
      return;
    }

    setMessage(t("auth.register.success"));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="register-name">{t("auth.register.name")}</Label>
        <Input
          id="register-name"
          autoComplete="name"
          placeholder={t("auth.register.nameOptional")}
          value={fullName}
          onChange={(ev) => setFullName(ev.target.value)}
        />
        <FieldHint>{t("auth.register.nameHint")}</FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">{t("auth.register.email")}</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.login.emailPlaceholder")}
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-password">{t("auth.register.password")}</Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder={t("auth.register.passwordPlaceholder")}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">{t("auth.register.passwordAgain")}</Label>
          <Input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            placeholder={t("auth.register.confirmPlaceholder")}
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            required
            minLength={8}
          />
        </div>
      </div>

      {error ? <p className="text-[0.85rem] leading-relaxed text-[oklch(0.78_0.12_22)]">{error}</p> : null}
      {message ? <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{message}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t("auth.register.creating")}
          </span>
        ) : (
          t("auth.register.submit")
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
