"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CalendarHeart, CheckCircle2, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { TherapistAvailabilityRow } from "@/types/database";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { bookTherapistSessionAction, type BookSessionResult } from "@/lib/actions/therapist-booking-actions";
import { premiumEase, softSpring } from "@/lib/animations/easing";
import { formatIstanbulDate, formatIstanbulSessionWindow, formatIstanbulTime } from "@/lib/i18n/datetime";
import type { AppLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

type Step = "pick" | "confirm" | "success" | "error";

function groupByDay(
  slots: TherapistAvailabilityRow[],
  locale: AppLocale,
): { label: string; items: TherapistAvailabilityRow[] }[] {
  const map = new Map<string, TherapistAvailabilityRow[]>();
  for (const slot of slots) {
    const label = formatIstanbulDate(slot.starts_at, locale);
    const bucket = map.get(label) ?? [];
    bucket.push(slot);
    map.set(label, bucket);
  }
  return [...map.entries()].map(([label, items]) => ({
    label,
    items: items.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
  }));
}

export function BookingFlowSheet({
  open,
  onOpenChange,
  therapistName,
  slots,
  onCompleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapistName: string;
  slots: TherapistAvailabilityRow[];
  onCompleted?: () => void;
}) {
  const { t, locale } = useI18n();
  const [step, setStep] = useState<Step>("pick");
  const [selected, setSelected] = useState<TherapistAvailabilityRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [prepNote, setPrepNote] = useState("");
  const [bookedSessionId, setBookedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      const clearTimer = window.setTimeout(() => {
        setStep("pick");
        setSelected(null);
        setBusy(false);
        setServerMessage(null);
        setPrepNote("");
        setBookedSessionId(null);
      }, 220);
      return () => window.clearTimeout(clearTimer);
    }
    return undefined;
  }, [open]);

  const grouped = useMemo(() => groupByDay(slots, locale), [slots, locale]);

  async function confirmBooking(): Promise<void> {
    if (!selected) return;
    setBusy(true);
    setServerMessage(null);
    const res: BookSessionResult = await bookTherapistSessionAction(selected.id, {
      initialNotebookBody: prepNote.trim() || undefined,
    });
    setBusy(false);
    if (res.ok) {
      setBookedSessionId(res.sessionId);
      setStep("success");
      onCompleted?.();
      return;
    }
    setStep("error");
    setServerMessage(res.message);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: premiumEase }}
        >
          <button
            type="button"
            aria-label={t("sessionBooking.closeAria")}
            className="absolute inset-0 bg-black/55 backdrop-blur-[10px]"
            onClick={() => (!busy ? onOpenChange(false) : null)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            initial={{ y: 28, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 18, opacity: 0, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className={cn(
              "relative z-[1] m-0 w-full max-w-lg overflow-hidden rounded-t-[1.75rem] border border-white/[0.08] bg-[color-mix(in_oklch,var(--color-card),transparent_6%)] shadow-[var(--shadow-glass)] backdrop-blur-[22px] sm:m-4 sm:rounded-[var(--radius-xl)]",
            )}
          >
            <div className="absolute inset-x-8 top-2 h-1 rounded-full bg-white/10 sm:hidden" />
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="grid size-10 place-items-center rounded-xl border border-border/55 bg-white/[0.04] text-muted-foreground">
                  <CalendarHeart className="size-5 stroke-[1.35]" />
                </span>
                <div>
                  <p className="text-[0.62rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {t("sessionBooking.kicker")}
                  </p>
                  <p id="booking-title" className="font-display text-[1.05rem] tracking-[-0.015em] text-foreground">
                    {therapistName}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-xl text-muted-foreground hover:text-foreground"
                disabled={busy}
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="max-h-[min(72vh,640px)] overflow-y-auto px-5 py-5">
              {step === "pick" ? (
                <div className="space-y-5">
                  <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("sessionBooking.pickIntro")}</p>
                  {grouped.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/55 bg-white/[0.02] px-4 py-10 text-center text-[0.9rem] text-muted-foreground">
                      {t("sessionBooking.noSlots")}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {grouped.map((g) => (
                        <div key={g.label} className="space-y-3">
                          <p className="text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                            {g.label}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {g.items.map((slot) => {
                              const active = selected?.id === slot.id;
                              return (
                                <motion.button
                                  key={slot.id}
                                  type="button"
                                  layout
                                  whileHover={{ y: -2, transition: softSpring }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelected(slot)}
                                  className={cn(
                                    "rounded-xl border px-3 py-3 text-left text-[0.84rem] transition-colors duration-200",
                                    active
                                      ? "border-white/[0.18] bg-white/[0.07] text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]"
                                      : "border-border/55 bg-white/[0.02] text-muted-foreground hover:border-border hover:bg-white/[0.04] hover:text-foreground",
                                  )}
                                >
                                  <span className="block text-foreground">{formatIstanbulTime(slot.starts_at, locale)}</span>
                                  <span className="mt-0.5 block text-[0.72rem] text-muted-foreground">
                                    {t("sessionBooking.minutesOnline", {
                                      mins: Math.max(
                                        1,
                                        Math.round(
                                          (new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime()) / 60000,
                                        ),
                                      ),
                                    })}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                      {t("sessionBooking.close")}
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl"
                      disabled={!selected}
                      onClick={() => setStep("confirm")}
                    >
                      {t("sessionBooking.continue")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === "confirm" && selected ? (
                <div className="space-y-5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="-ml-2 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => setStep("pick")}
                    disabled={busy}
                  >
                    <ArrowLeft className="size-4" />
                    {t("sessionBooking.backToSlots")}
                  </Button>

                  <div className="rounded-[var(--radius-lg)] border border-border/50 bg-white/[0.03] p-4">
                    <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      {t("sessionBooking.summary")}
                    </p>
                    <p className="mt-2 font-display text-[1.15rem] tracking-[-0.02em]">{therapistName}</p>
                    <p className="mt-1 text-[0.88rem] text-muted-foreground">
                      {formatIstanbulSessionWindow(selected.starts_at, selected.ends_at, locale)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-white/[0.02] px-4 py-3">
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {t("sessionBooking.prepTitle")}
                    </p>
                    <p className="mt-1 text-[0.72rem] text-muted-foreground">{t("sessionBooking.prepHelp")}</p>
                    <textarea
                      value={prepNote}
                      onChange={(e) => setPrepNote(e.target.value)}
                      rows={4}
                      maxLength={50000}
                      placeholder={t("sessionBooking.prepPlaceholder")}
                      className={cn(
                        "mt-3 min-h-[100px] w-full resize-y rounded-xl border border-border/70 bg-input px-3 py-2.5 text-[0.88rem] text-foreground placeholder:text-muted-foreground/75 focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring/55",
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3 text-[0.8rem] leading-relaxed text-amber-100/90">
                    {t("sessionBooking.paymentNotice")}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                    <Button type="button" variant="outline" className="rounded-xl" disabled={busy} onClick={() => onOpenChange(false)}>
                      {t("sessionBooking.cancel")}
                    </Button>
                    <Button type="button" className="rounded-xl" disabled={busy} onClick={confirmBooking}>
                      {busy ? t("sessionBooking.saving") : t("sessionBooking.confirmHold")}
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: premiumEase }}
                  className="space-y-5 py-2 text-center"
                >
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-100">
                    <CheckCircle2 className="size-7" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-[1.35rem] tracking-[-0.02em]">{t("sessionBooking.successTitle")}</h3>
                    <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("sessionBooking.successBody")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                    {bookedSessionId ? (
                      <Button asChild className="rounded-xl">
                        <Link href={`/dashboard/sessions/${bookedSessionId}/notebook`}>{t("sessionBooking.openNotebook")}</Link>
                      </Button>
                    ) : null}
                    <Button type="button" className="rounded-xl" variant={bookedSessionId ? "outline" : "default"} onClick={() => onOpenChange(false)}>
                      {t("sessionBooking.done")}
                    </Button>
                  </div>
                </motion.div>
              ) : null}

              {step === "error" ? (
                <div className="space-y-4 py-2">
                  <div className="flex items-start gap-3 rounded-xl border border-rose-500/18 bg-rose-500/[0.06] p-4 text-left">
                    <Sparkles className="mt-0.5 size-5 text-rose-100/90" />
                    <div>
                      <p className="font-display text-[1.1rem] tracking-[-0.015em]">{t("sessionBooking.errorTitle")}</p>
                      <p className="mt-1 text-[0.86rem] leading-relaxed text-rose-50/90">
                        {serverMessage ?? t("sessionBooking.errorFallback")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                      {t("sessionBooking.close")}
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl"
                      onClick={() => {
                        setStep("pick");
                        setSelected(null);
                      }}
                    >
                      {t("sessionBooking.pickAnother")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
