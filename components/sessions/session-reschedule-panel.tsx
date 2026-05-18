"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CalendarSync } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  cancelRescheduleRequestAction,
  createRescheduleRequestAction,
  createTherapistRescheduleRequestAction,
  fetchRescheduleSlotsAction,
  resolveRescheduleRequestAction,
} from "@/lib/actions/session-reschedule-actions";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";
import type { RescheduleRequestRow } from "@/lib/supabase/reschedule-repository";
import type { TherapistAvailabilityRow } from "@/types/database";
import { cn } from "@/lib/utils";

export type ViewerRole = "user" | "therapist";

export function SessionReschedulePanel({
  sessionId,
  profileId,
  viewerUserId,
  viewerRole,
  pending,
  allowPropose,
}: {
  sessionId: string;
  profileId: string;
  viewerUserId: string;
  viewerRole: ViewerRole;
  pending: RescheduleRequestRow | null;
  allowPropose: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<TherapistAvailabilityRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busy, start] = useTransition();

  const counterpartyWaiting = pending && pending.proposed_by === viewerUserId;
  const needsResolution = pending && pending.proposed_by !== viewerUserId;

  const proposedLabel = useMemo(() => {
    const slot = pending?.proposed_slot;
    if (!slot) return null;
    return formatIstanbulSessionWindow(slot.starts_at, slot.ends_at, locale);
  }, [pending, locale]);

  function loadSlots() {
    setLoadErr(null);
    start(async () => {
      const res = await fetchRescheduleSlotsAction(profileId);
      if (!res.ok) {
        setLoadErr(res.message);
        return;
      }
      setSlots(res.slots);
    });
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && slots.length === 0) loadSlots();
  }

  function propose(availabilityId: string) {
    setLoadErr(null);
    start(async () => {
      const action =
        viewerRole === "user" ? createRescheduleRequestAction : createTherapistRescheduleRequestAction;
      const res = await action({ sessionId, proposedAvailabilityId: availabilityId });
      if (!res.ok) {
        setLoadErr(res.message);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function cancelPending() {
    if (!pending) return;
    setLoadErr(null);
    start(async () => {
      const res = await cancelRescheduleRequestAction(pending.id);
      if (!res.ok) {
        setLoadErr(res.message);
        return;
      }
      router.refresh();
    });
  }

  function resolve(accept: boolean) {
    if (!pending) return;
    setLoadErr(null);
    start(async () => {
      const res = await resolveRescheduleRequestAction(pending.id, accept);
      if (!res.ok) {
        setLoadErr(res.message);
        return;
      }
      router.refresh();
    });
  }

  if (!pending && !allowPropose) return null;

  return (
    <div className="mt-4 rounded-xl border border-border/45 bg-white/[0.02] p-4 text-[0.86rem]">
      <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        <CalendarSync className="size-3.5" />
        {t("reschedule.title")}
      </div>

      {loadErr ? <p className="mt-2 text-[0.8rem] text-rose-200/90">{loadErr}</p> : null}

      {counterpartyWaiting ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">{t("reschedule.pendingYou")}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={busy}
            onClick={cancelPending}
          >
            {t("reschedule.cancelRequest")}
          </Button>
        </div>
      ) : null}

      {needsResolution && proposedLabel ? (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-[0.72rem] font-medium text-muted-foreground">{t("reschedule.pendingOther")}</p>
            <p className="mt-1 text-foreground/95">{proposedLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className="rounded-xl" disabled={busy} onClick={() => resolve(true)}>
              {busy ? t("reschedule.resolving") : t("reschedule.accept")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={busy}
              onClick={() => resolve(false)}
            >
              {t("reschedule.reject")}
            </Button>
          </div>
        </div>
      ) : null}

      {allowPropose && !pending ? (
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={toggleOpen}
            disabled={busy}
          >
            {open ? t("common.cancel") : t("reschedule.propose")}
          </Button>
        </div>
      ) : null}

      {open && !pending ? (
        <div className="mt-4 space-y-2 border-t border-border/35 pt-4">
          <p className="text-[0.75rem] text-muted-foreground">{t("reschedule.chooseSlot")}</p>
          {slots.length === 0 ? (
            <p className="text-[0.8rem] text-muted-foreground">{t("reschedule.noSlots")}</p>
          ) : (
            <ul className="max-h-52 space-y-1.5 overflow-y-auto">
              {slots.map((slot) => (
                <li key={slot.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => propose(slot.id)}
                    className={cn(
                      "w-full rounded-lg border border-border/45 px-3 py-2 text-left text-[0.8rem] transition-colors",
                      "hover:border-border/70 hover:bg-white/[0.04]",
                    )}
                  >
                    {formatIstanbulSessionWindow(slot.starts_at, slot.ends_at, locale)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
