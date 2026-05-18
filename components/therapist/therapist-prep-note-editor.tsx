"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { saveTherapistPrepNoteAction } from "@/lib/actions/therapist-prep-note-actions";

export function TherapistPrepNoteEditor({
  sessionId,
  initialBody,
}: {
  sessionId: string;
  initialBody: string;
}) {
  const { t } = useI18n();
  const [body, setBody] = useState(initialBody);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveTherapistPrepNoteAction(sessionId, body);
      if (!res.ok) {
        setMsg(res.message);
        return;
      }
      setMsg(t("therapist.prep.saved"));
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="rounded-xl">
          <Link href="/therapist/sessions">
            <ArrowLeft className="mr-1.5 size-4" />
            {t("therapist.prep.back")}
          </Link>
        </Button>
      </div>
      <header className="space-y-2">
        <h1 className="font-display text-[1.75rem] tracking-[-0.03em]">{t("therapist.prep.title")}</h1>
        <p className="text-[0.9rem] text-muted-foreground">{t("therapist.prep.subtitle")}</p>
      </header>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("therapist.prep.placeholder")}
        rows={18}
        className="w-full resize-y rounded-xl border border-border/55 bg-white/[0.03] px-4 py-3 text-[0.9rem] leading-relaxed text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:border-border focus:ring-2 focus:ring-white/10"
      />
      {msg ? (
        <p className="text-[0.86rem] text-muted-foreground" role="status">
          {msg}
        </p>
      ) : null}
      <Button type="button" className="rounded-xl" disabled={pending} onClick={save}>
        {pending ? t("common.loading") : t("common.save")}
      </Button>
    </div>
  );
}
