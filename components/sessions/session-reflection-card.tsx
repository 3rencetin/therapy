"use client";

import { useState, useTransition } from "react";

import { saveSessionReflectionAction } from "@/lib/actions/session-reflection-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SessionReflectionCard({
  sessionId,
  initialMood,
  initialNote,
  enabled,
}: {
  sessionId: string;
  initialMood: number | null;
  initialNote: string;
  enabled: boolean;
}) {
  const [mood, setMood] = useState<number>(initialMood ?? 3);
  const [note, setNote] = useState(initialNote);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!enabled) return null;

  return (
    <section className="rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-5 shadow-[var(--shadow-glass)]">
      <h2 className="font-display text-[1.15rem] tracking-[-0.02em]">Seans sonrası mini değerlendirme</h2>
      <p className="mt-1 text-[0.82rem] text-muted-foreground">Bugün seansın sende nasıl bir etki bıraktı?</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setMood(n)}
            className={cn(
              "rounded-full border px-3 py-1 text-[0.82rem] transition-colors",
              mood === n ? "border-[#007AFF55] bg-[#007AFF18] text-[#0A4B97]" : "border-border text-muted-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Seans sonrası kısa bir not..."
        className="mt-3 w-full rounded-xl border border-border/70 bg-input px-3 py-2.5 text-[0.88rem]"
      />

      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            setFeedback(null);
            start(async () => {
              const res = await saveSessionReflectionAction({ sessionId, mood, note });
              setFeedback(res.ok ? "Kaydedildi." : res.message);
            });
          }}
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
        {feedback ? <p className="text-[0.82rem] text-muted-foreground">{feedback}</p> : null}
      </div>
    </section>
  );
}
