"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Trash2, BookMarked, ArrowLeft } from "lucide-react";

import {
  createSessionNotebookPageAction,
  deleteSessionNotebookPageAction,
  saveSessionNotebookPageAction,
} from "@/lib/actions/session-notebook-actions";
import type { ClientSessionNotebookContext, SessionNotebookPageDTO } from "@/lib/supabase/session-notebook-repository";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SessionNotebookEditor({
  sessionId,
  context,
  initialPages,
}: {
  sessionId: string;
  context: ClientSessionNotebookContext;
  initialPages: SessionNotebookPageDTO[];
}) {
  const { t, locale } = useI18n();
  const [pages, setPages] = useState<SessionNotebookPageDTO[]>(initialPages);
  const [activeId, setActiveId] = useState<string | null>(() => initialPages[0]?.id ?? null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftTherapistCanView, setDraftTherapistCanView] = useState(true);
  const [feedback, setFeedback] = useState<{ variant: "ok" | "err"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const readOnly = context.status === "cancelled";
  const active = useMemo(() => pages.find((p) => p.id === activeId) ?? null, [pages, activeId]);

  useEffect(() => {
    if (!active) {
      setDraftTitle("");
      setDraftBody("");
      setDraftTherapistCanView(true);
      return;
    }
    setDraftTitle(active.title);
    setDraftBody(active.body);
    setDraftTherapistCanView(active.therapist_can_view);
  }, [active?.id, active?.title, active?.body, active]);

  function saveCurrent() {
    if (readOnly || !active) return;
    setFeedback(null);
    start(async () => {
      const res = await saveSessionNotebookPageAction({
        sessionId,
        pageId: active.id,
        title: draftTitle,
        body: draftBody,
        therapistCanView: draftTherapistCanView,
      });
      if (!res.ok) {
        setFeedback({ variant: "err", text: res.message });
        return;
      }
      setPages((prev) =>
        prev.map((p) =>
          p.id === active.id
            ? {
                ...p,
                title: draftTitle.trim(),
                body: draftBody,
                therapist_can_view: draftTherapistCanView,
                updated_at: new Date().toISOString(),
              }
            : p,
        ),
      );
      setFeedback({ variant: "ok", text: t("sessions.notebook.saved") });
    });
  }

  function addPage() {
    if (readOnly) return;
    setFeedback(null);
    start(async () => {
      const res = await createSessionNotebookPageAction(sessionId);
      if (!res.ok) {
        setFeedback({ variant: "err", text: res.message });
        return;
      }
      const nextSort = pages.length === 0 ? 0 : Math.max(...pages.map((p) => p.sort_order)) + 1;
      const row: SessionNotebookPageDTO = {
        id: res.pageId,
        sort_order: nextSort,
        title: "",
        body: "",
        therapist_can_view: true,
        updated_at: new Date().toISOString(),
      };
      setPages((p) => [...p, row]);
      setActiveId(res.pageId);
      setDraftTitle("");
      setDraftBody("");
    });
  }

  function removePage(id: string) {
    if (readOnly) return;
    setFeedback(null);
    start(async () => {
      const res = await deleteSessionNotebookPageAction(sessionId, id);
      if (!res.ok) {
        setFeedback({ variant: "err", text: res.message });
        return;
      }
      setPages((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null);
        }
        return next;
      });
    });
  }

  const heading = context.therapist?.full_name ?? t("common.therapistFallback");

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="-ml-2 h-auto gap-2 rounded-xl px-2 py-1 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/sessions">
              <ArrowLeft className="size-4" />
              {t("sessions.notebook.back")}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl border border-border/55 bg-white/[0.03] text-muted-foreground">
              <BookMarked className="size-5 stroke-[1.35]" />
            </span>
            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t("sessions.notebook.title")}
              </p>
              <h1 className="font-display text-[1.75rem] tracking-[-0.03em]">{heading}</h1>
              <p className="text-[0.88rem] text-muted-foreground">
                {formatIstanbulSessionWindow(context.starts_at, context.ends_at, locale)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {!readOnly ? (
            <Button type="button" variant="outline" className="rounded-xl" disabled={pending} onClick={addPage}>
              <Plus className="mr-1.5 size-4" />
              {t("sessions.notebook.newPage")}
            </Button>
          ) : null}
          {!readOnly ? (
            <Button type="button" className="rounded-xl" disabled={pending || !active} onClick={saveCurrent}>
              {pending ? t("sessions.notebook.saving") : t("sessions.notebook.saveNow")}
            </Button>
          ) : null}
        </div>
      </header>

      {readOnly ? (
        <p className="rounded-xl border border-border/50 bg-white/[0.02] px-4 py-3 text-[0.88rem] text-muted-foreground">
          {t("sessions.notebook.readOnlyClient")}
        </p>
      ) : null}

      {feedback ? (
        <p
          className={cn(
            "rounded-xl px-4 py-2 text-[0.86rem]",
            feedback.variant === "ok"
              ? "border border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-50/95"
              : "border border-rose-500/20 bg-rose-500/[0.06] text-rose-50/92",
          )}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
        <aside className="space-y-2 rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-3">
          <p className="px-2 pb-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {t("sessions.notebook.pagesLabel")}
          </p>
          {pages.length === 0 ? (
            <p className="px-2 py-6 text-center text-[0.82rem] text-muted-foreground">
              {t("sessions.notebook.emptyPagesHint")}
            </p>
          ) : (
            <ul className="space-y-1">
              {pages.map((p, idx) => {
                const on = p.id === activeId;
                const label =
                  p.title.trim() ||
                  (p.body.trim() ? `${p.body.trim().slice(0, 24)}${p.body.trim().length > 24 ? "…" : ""}` : t("sessions.notebook.pageNumber", { n: idx + 1 }));
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(p.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[0.82rem] transition-colors",
                        on
                          ? "border-violet-400/35 bg-violet-500/12 text-foreground"
                          : "border-transparent bg-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      <span className="truncate">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="space-y-4 rounded-[var(--radius-xl)] border border-border/45 bg-white/[0.02] p-5 shadow-[var(--shadow-glass)]">
          {!active ? (
            <p className="py-16 text-center text-[0.9rem] text-muted-foreground">
              {t("sessions.notebook.pickOrAdd")}
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground" htmlFor="nb-title">
                    {t("sessions.notebook.titleLabel")}
                  </label>
                  <Input
                    id="nb-title"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder={t("sessions.notebook.titlePlaceholder")}
                    disabled={readOnly}
                    className="rounded-xl"
                  />
                </div>
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 rounded-xl text-rose-200/90 hover:bg-rose-500/[0.1]"
                    disabled={pending}
                    onClick={() => removePage(active.id)}
                  >
                    <Trash2 className="mr-1 size-4" />
                    {t("sessions.notebook.deletePage")}
                  </Button>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground" htmlFor="nb-body">
                  {t("sessions.notebook.notesFieldLabel")}
                </label>
                <textarea
                  id="nb-body"
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  disabled={readOnly}
                  placeholder={t("sessions.notebook.bodyPlaceholderClient")}
                  rows={18}
                  className={cn(
                    "min-h-[320px] w-full resize-y rounded-xl border border-border/70 bg-input px-3.5 py-3 text-[0.9375rem] text-foreground shadow-[0_1px_0_oklch(1_0_0/0.03)_inset] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground/75 focus-visible:border-border focus-visible:bg-white/[0.045] focus-visible:ring-2 focus-visible:ring-ring/55 disabled:cursor-not-allowed disabled:opacity-45",
                  )}
                />
                <p className="text-[0.72rem] text-muted-foreground">
                  {t("sessions.notebook.savePagesHint")}
                </p>
                {!readOnly ? (
                  <label className="mt-2 flex items-center gap-2 text-[0.78rem] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={draftTherapistCanView}
                      onChange={(e) => setDraftTherapistCanView(e.target.checked)}
                      className="size-4"
                    />
                    {t("sessions.notebook.therapistCanView")}
                  </label>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
