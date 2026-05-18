"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { TherapistAvailabilityRow } from "@/types/database";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  therapistAddAvailabilityAction,
  therapistBulkGenerateAvailabilityAction,
  therapistDeleteAvailabilityAction,
} from "@/lib/actions/therapist-workspace-actions";
import { generateAvailabilitySlots } from "@/lib/therapist/generate-availability-slots";
import { formatIstanbulDate, formatIstanbulTime } from "@/lib/i18n/datetime";
import { cn } from "@/lib/utils";

const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0] as const;

export function TherapistAvailabilityEditor({
  initialSlots,
  todayYmd,
  defaultRangeEndYmd,
}: {
  initialSlots: TherapistAvailabilityRow[];
  todayYmd: string;
  defaultRangeEndYmd: string;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [bulkInfo, setBulkInfo] = useState<string | null>(null);

  const [fromYmd, setFromYmd] = useState(todayYmd);
  const [toYmd, setToYmd] = useState(defaultRangeEndYmd >= todayYmd ? defaultRangeEndYmd : todayYmd);
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [dayStart, setDayStart] = useState("09:00");
  const [dayEnd, setDayEnd] = useState("18:00");
  const [sessionMin, setSessionMin] = useState(50);
  const [breakMin, setBreakMin] = useState(10);

  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");

  const weekdayOpts = useMemo(
    () =>
      WEEKDAY_VALUES.map((value) => ({
        value,
        label: t(`therapist.availabilityEditor.weekday${value}`),
      })),
    [t],
  );

  const previewSlots = useMemo(() => {
    return generateAvailabilitySlots({
      fromYmd,
      toYmd,
      weekdaysSun0: weekdays,
      dayStartHHmm: dayStart,
      dayEndHHmm: dayEnd,
      sessionMinutes: sessionMin,
      breakMinutes: breakMin,
      maxSlots: 480,
    });
  }, [fromYmd, toYmd, weekdays, dayStart, dayEnd, sessionMin, breakMin]);

  function toIso(local: string): string {
    if (!local) return "";
    const d = new Date(local);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  }

  function toggleWeekday(v: number) {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-[var(--radius-xl)] border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.06] to-transparent p-6 shadow-[var(--shadow-glass)]">
        <p className="font-display text-lg tracking-[-0.02em]">{t("therapist.availabilityEditor.bulkTitle")}</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/85">{t("therapist.availabilityEditor.istanbulBold")}</span>
          {t("therapist.availabilityEditor.bulkPart1")}
          <span className="font-medium text-foreground/85">{t("therapist.availabilityEditor.rhythmBold")}</span>
          {t("therapist.availabilityEditor.bulkPart2")}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bulk-from" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.dateFrom")}
            </Label>
            <Input
              id="bulk-from"
              type="date"
              min={todayYmd}
              value={fromYmd}
              onChange={(e) => setFromYmd(e.target.value)}
              className="rounded-xl bg-background/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-to" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.dateTo")}
            </Label>
            <Input
              id="bulk-to"
              type="date"
              min={fromYmd}
              value={toYmd}
              onChange={(e) => setToYmd(e.target.value)}
              className="rounded-xl bg-background/30"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            {t("therapist.availabilityEditor.weekdays")}
          </p>
          <div className="flex flex-wrap gap-2">
            {weekdayOpts.map((w) => {
              const on = weekdays.has(w.value);
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => toggleWeekday(w.value)}
                  className={cn(
                    "min-w-[3rem] rounded-lg border px-3 py-2 text-[0.8rem] font-medium transition-colors",
                    on
                      ? "border-violet-400/40 bg-violet-500/15 text-foreground"
                      : "border-border/50 bg-white/[0.02] text-muted-foreground hover:border-border",
                  )}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.dayStart")}
            </Label>
            <Input
              type="time"
              value={dayStart}
              onChange={(e) => setDayStart(e.target.value)}
              className="rounded-xl bg-background/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.dayEnd")}
            </Label>
            <Input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} className="rounded-xl bg-background/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.sessionMin")}
            </Label>
            <Input
              type="number"
              min={15}
              max={180}
              value={sessionMin}
              onChange={(e) => setSessionMin(Number.parseInt(e.target.value, 10) || 50)}
              className="rounded-xl bg-background/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.breakMin")}
            </Label>
            <Input
              type="number"
              min={0}
              max={120}
              value={breakMin}
              onChange={(e) => setBreakMin(Number.parseInt(e.target.value, 10) || 0)}
              className="rounded-xl bg-background/30"
            />
          </div>
        </div>

        <p className="mt-4 rounded-lg border border-border/40 bg-white/[0.02] px-3 py-2 text-[0.78rem] text-muted-foreground">
          {t("therapist.availabilityEditor.preview", { count: previewSlots.length })}
        </p>

        {bulkInfo ? <p className="mt-3 text-[0.82rem] text-emerald-100/90">{bulkInfo}</p> : null}
        {message ? <p className="mt-3 text-[0.82rem] text-amber-100/90">{message}</p> : null}

        <Button
          type="button"
          className="mt-5 rounded-xl"
          disabled={pending}
          onClick={() => {
            setMessage(null);
            setBulkInfo(null);
            start(async () => {
              const res = await therapistBulkGenerateAvailabilityAction({
                fromYmd,
                toYmd,
                weekdaysSun0: [...weekdays],
                dayStartHHmm: dayStart,
                dayEndHHmm: dayEnd,
                sessionMinutes: sessionMin,
                breakMinutes: breakMin,
              });
              if (!res.ok) {
                setMessage(res.message);
                return;
              }
              if (res.created === 0) {
                setBulkInfo(
                  res.skippedExisting > 0
                    ? t("therapist.availabilityEditor.bulkNoneDup", { n: res.skippedExisting })
                    : t("therapist.availabilityEditor.bulkNone"),
                );
              } else {
                setBulkInfo(
                  `${t("therapist.availabilityEditor.bulkAdded", { created: res.created })}${
                    res.skippedExisting > 0
                      ? ` ${t("therapist.availabilityEditor.bulkSkippedSuffix", { n: res.skippedExisting })}`
                      : ""
                  }`,
                );
              }
              router.refresh();
            });
          }}
        >
          {t("therapist.availabilityEditor.bulkSubmit")}
        </Button>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-6 shadow-[var(--shadow-glass)]">
        <p className="font-display text-lg tracking-[-0.02em]">{t("therapist.availabilityEditor.singleTitle")}</p>
        <p className="mt-1 text-[0.82rem] text-muted-foreground">{t("therapist.availabilityEditor.singleHint")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slot-start" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.start")}
            </Label>
            <Input
              id="slot-start"
              type="datetime-local"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
              className="rounded-xl bg-background/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot-end" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
              {t("therapist.availabilityEditor.end")}
            </Label>
            <Input
              id="slot-end"
              type="datetime-local"
              value={endLocal}
              onChange={(e) => setEndLocal(e.target.value)}
              className="rounded-xl bg-background/30"
            />
          </div>
        </div>
        <Button
          type="button"
          className="mt-5 rounded-xl"
          disabled={pending}
          onClick={() => {
            setMessage(null);
            setBulkInfo(null);
            const starts_at = toIso(startLocal);
            const ends_at = toIso(endLocal);
            if (!starts_at || !ends_at) {
              setMessage(t("therapist.availabilityEditor.needStartEnd"));
              return;
            }
            start(async () => {
              const res = await therapistAddAvailabilityAction({ starts_at, ends_at });
              if (!res.ok) {
                setMessage(res.message);
                return;
              }
              setStartLocal("");
              setEndLocal("");
              router.refresh();
            });
          }}
        >
          {t("therapist.availabilityEditor.addSlot")}
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t("therapist.availabilityEditor.openSlots")}
        </p>
        <ul className="space-y-2">
          {initialSlots.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/50 px-4 py-12 text-center text-[0.88rem] text-muted-foreground">
              {t("therapist.availabilityEditor.emptySlots")}
            </li>
          ) : (
            initialSlots.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border border-border/45 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[0.88rem] text-foreground">{formatIstanbulDate(s.starts_at, locale)}</p>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {formatIstanbulTime(s.starts_at, locale)} – {formatIstanbulTime(s.ends_at, locale)} ·{" "}
                    {t("therapist.availabilityEditor.tzSuffix")}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start rounded-lg text-rose-100/90 hover:bg-rose-500/[0.08] sm:self-auto"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await therapistDeleteAvailabilityAction(s.id);
                      router.refresh();
                    })
                  }
                >
                  {t("therapist.availabilityEditor.remove")}
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
