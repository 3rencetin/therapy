"use client";

import { useMemo, useState, useTransition } from "react";

import {
  createUserNoteAction,
  deleteUserNoteAction,
  updateUserNoteAction,
} from "@/lib/actions/personal-writing-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NoteRow = {
  id: string;
  note_date: string;
  title: string;
  body: string;
  updated_at: string;
};

export function NotesEditor({ initialNotes }: { initialNotes: NoteRow[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [activeId, setActiveId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? null, [notes, activeId]);
  const [date, setDate] = useState(active?.note_date ?? new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(active?.title ?? "");
  const [body, setBody] = useState(active?.body ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function syncFromActive(id: string | null, list: NoteRow[]) {
    const n = list.find((x) => x.id === id) ?? null;
    setDate(n?.note_date ?? new Date().toISOString().slice(0, 10));
    setTitle(n?.title ?? "");
    setBody(n?.body ?? "");
  }

  return (
    <section className="mx-auto max-w-5xl space-y-4 pb-20">
      <header>
        <h1 className="font-display text-[1.8rem] tracking-[-0.03em]">Notlar</h1>
        <p className="text-[0.88rem] text-muted-foreground">Yeni sayfalar ekle, tarih seç, notları sakla.</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-3 shadow-[var(--shadow-glass)]">
          <Button
            className="mb-3 w-full"
            disabled={pending}
            onClick={() => {
              start(async () => {
                const res = await createUserNoteAction({ noteDate: new Date().toISOString().slice(0, 10), title: "", body: "" });
                if (!res.ok) return setFeedback(res.message);
                const next: NoteRow = {
                  id: res.id,
                  note_date: new Date().toISOString().slice(0, 10),
                  title: "",
                  body: "",
                  updated_at: new Date().toISOString(),
                };
                const list = [next, ...notes];
                setNotes(list);
                setActiveId(next.id);
                syncFromActive(next.id, list);
              });
            }}
          >
            + Yeni not
          </Button>
          <div className="space-y-1">
            {notes.map((n, i) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setActiveId(n.id);
                  syncFromActive(n.id, notes);
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-[0.82rem]",
                  activeId === n.id ? "border-[#007AFF44] bg-[#007AFF14] text-[#0A4B97]" : "border-transparent text-muted-foreground hover:bg-white/[0.04]",
                )}
              >
                {n.title.trim() || `Not ${i + 1}`}
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-5 shadow-[var(--shadow-glass)] space-y-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[220px]" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-border/70 bg-input px-3.5 py-3 text-[0.9rem]"
            placeholder="Notunu yaz..."
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={pending || !activeId}
              onClick={() => {
                if (!activeId) return;
                setFeedback(null);
                start(async () => {
                  const res = await updateUserNoteAction({ id: activeId, noteDate: date, title, body });
                  if (!res.ok) return setFeedback(res.message);
                  setNotes((prev) =>
                    prev.map((n) => (n.id === activeId ? { ...n, note_date: date, title, body, updated_at: new Date().toISOString() } : n)),
                  );
                  setFeedback("Kaydedildi.");
                });
              }}
            >
              Kaydet
            </Button>
            <Button
              variant="outline"
              disabled={pending || !activeId}
              onClick={() => {
                if (!activeId) return;
                start(async () => {
                  const id = activeId;
                  const res = await deleteUserNoteAction(id);
                  if (!res.ok) return setFeedback(res.message);
                  const list = notes.filter((n) => n.id !== id);
                  setNotes(list);
                  const nextId = list[0]?.id ?? null;
                  setActiveId(nextId);
                  syncFromActive(nextId, list);
                });
              }}
            >
              Sil
            </Button>
            {feedback ? <p className="text-[0.82rem] text-muted-foreground">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
