"use client";

import { useMemo, useState, useTransition } from "react";

import { saveJournalEntryAction } from "@/lib/actions/personal-writing-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type JournalRow = {
  id: string;
  entry_date: string;
  title: string;
  body: string;
  updated_at: string;
};

export function JournalEditor({ initialEntries }: { initialEntries: JournalRow[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const byDate = useMemo(() => new Map(initialEntries.map((x) => [x.entry_date, x])), [initialEntries]);
  const [date, setDate] = useState(today);
  const row = byDate.get(date);
  const [title, setTitle] = useState(row?.title ?? "");
  const [body, setBody] = useState(row?.body ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="mx-auto max-w-5xl space-y-4 pb-20">
      <header>
        <h1 className="font-display text-[1.8rem] tracking-[-0.03em]">Günlük</h1>
        <p className="text-[0.88rem] text-muted-foreground">Tarih seç, günlüğünü yaz, kaydet.</p>
      </header>

      <div className="rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-5 shadow-[var(--shadow-glass)] space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[0.75rem] text-muted-foreground">Tarih</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              const d = e.target.value;
              setDate(d);
              const r = byDate.get(d);
              setTitle(r?.title ?? "");
              setBody(r?.body ?? "");
            }}
            className="w-[200px]"
          />
        </div>

        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className="w-full rounded-xl border border-border/70 bg-input px-3.5 py-3 text-[0.9rem]"
          placeholder="Bugün nasılsın?"
        />
        <div className="flex items-center gap-3">
          <Button
            disabled={pending}
            onClick={() => {
              setFeedback(null);
              start(async () => {
                const res = await saveJournalEntryAction({ entryDate: date, title, body });
                setFeedback(res.ok ? "Kaydedildi." : res.message);
              });
            }}
          >
            {pending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          {feedback ? <p className="text-[0.82rem] text-muted-foreground">{feedback}</p> : null}
        </div>
      </div>
    </section>
  );
}
