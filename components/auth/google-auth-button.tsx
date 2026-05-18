"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleAuthButton() {
  const { t } = useI18n();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
  }

  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={loading} className="w-full">
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {t("auth.googleRedirecting")}
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <GoogleGlyph />
          {t("auth.google")}
        </span>
      )}
    </Button>
  );
}

function GoogleGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <path
        fill="currentColor"
        d="M21.35 12.24c0-.74-.07-1.44-.19-2.12H12v4.01h5.26c-.23 1.22-.93 2.25-1.98 2.95v2.46h3.2c1.87-1.72 2.87-4.24 2.87-7.3z"
        opacity="0.9"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.89 6.62-2.41l-3.2-2.46c-.89.6-2.03.95-3.42.95-2.63 0-4.86-1.78-5.65-4.17H3.1v2.55A10.01 10.01 0 0012 22z"
        opacity="0.55"
      />
      <path
        fill="currentColor"
        d="M6.35 13.91c-.2-.6-.31-1.24-.31-1.91s.11-1.31.31-1.91V7.54H3.1A10.01 10.01 0 002 12c0 1.62.39 3.14 1.1 4.46l3.25-2.55z"
        opacity="0.35"
      />
      <path
        fill="currentColor"
        d="M12 5.94c1.48 0 2.81.51 3.85 1.51l2.89-2.89C16.95 2.99 14.7 2 12 2 7.7 2 3.99 4.72 3.1 8.54l3.25 2.55c.79-2.39 3.02-4.15 5.65-4.15z"
        opacity="0.65"
      />
    </svg>
  );
}
