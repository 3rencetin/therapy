"use client";

import { useMemo, useState } from "react";
import { Loader2, Lock, Mail, User } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/field-hint";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { GoogleAuthButton } from "./google-auth-button";

function isValidFullName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 3) return false;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

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

    const name = fullName.trim();

    if (!isValidFullName(name)) {
      setError(t("auth.register.nameRequired"));
      return;
    }

    if (password !== confirm) {
      setError(t("auth.register.mismatch"));
      return;
    }

    setLoading(true);

    const { error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name },
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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <AuthField
        id="register-name"
        label={t("auth.register.name")}
        autoComplete="name"
        placeholder={t("auth.register.namePlaceholder")}
        value={fullName}
        onChange={(ev) => setFullName(ev.target.value)}
        required
        minLength={3}
        icon={<User className="size-4" strokeWidth={1.6} />}
        hint={<FieldHint>{t("auth.register.nameHint")}</FieldHint>}
      />

      <AuthField
        id="register-email"
        label={t("auth.register.email")}
        type="email"
        autoComplete="email"
        placeholder={t("auth.login.emailPlaceholder")}
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        required
        icon={<Mail className="size-4" strokeWidth={1.6} />}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          id="register-password"
          label={t("auth.register.password")}
          type="password"
          autoComplete="new-password"
          placeholder={t("auth.register.passwordPlaceholder")}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
          minLength={8}
          icon={<Lock className="size-4" strokeWidth={1.6} />}
          hint={<FieldHint>{t("auth.register.passwordHint")}</FieldHint>}
        />
        <AuthField
          id="register-confirm"
          label={t("auth.register.passwordAgain")}
          type="password"
          autoComplete="new-password"
          placeholder={t("auth.register.confirmPlaceholder")}
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
          required
          minLength={8}
          icon={<Lock className="size-4" strokeWidth={1.6} />}
        />
      </div>

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
            {t("auth.register.creating")}
          </span>
        ) : (
          t("auth.register.submit")
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
