"use client";

import { useTransition } from "react";
import { BadgeCheck, ShieldOff } from "lucide-react";

import type { TherapistProfileRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { adminToggleTherapistActiveAction, adminToggleTherapistVerifiedAction } from "@/lib/actions/admin-therapist-actions";
import { cn } from "@/lib/utils";

export function TherapistsModerationTable({ therapists }: { therapists: TherapistProfileRow[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] shadow-[var(--shadow-glass)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[0.84rem]">
          <thead className="border-b border-border/45 bg-white/[0.02] text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">user_id</th>
              <th className="px-4 py-3 font-medium">Doğrulama</th>
              <th className="px-4 py-3 font-medium">Aktif</th>
              <th className="px-4 py-3 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/35">
            {therapists.map((t) => (
              <tr key={t.profile_id} className="text-muted-foreground hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-foreground/90">{t.full_name}</td>
                <td className="px-4 py-3 font-mono text-[0.72rem]">{t.user_id ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[0.62rem] font-medium uppercase",
                      t.verified ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100/90" : "border-border/50 bg-white/[0.03]",
                    )}
                  >
                    {t.verified ? "Evet" : "Hayır"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[0.62rem] font-medium uppercase",
                      t.active ? "border-sky-400/22 bg-sky-500/10 text-sky-100/85" : "border-border/50 bg-white/[0.03]",
                    )}
                  >
                    {t.active ? "Açık" : "Kapalı"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      className="h-8 gap-1 rounded-lg text-[0.72rem]"
                      onClick={() =>
                        start(async () => {
                          await adminToggleTherapistVerifiedAction(t.profile_id, !t.verified);
                        })
                      }
                    >
                      <BadgeCheck className="size-3.5" />
                      {t.verified ? "Doğrulamayı kaldır" : "Doğrula"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      className="h-8 gap-1 rounded-lg text-[0.72rem] text-muted-foreground"
                      onClick={() =>
                        start(async () => {
                          await adminToggleTherapistActiveAction(t.profile_id, !t.active);
                        })
                      }
                    >
                      <ShieldOff className="size-3.5" />
                      {t.active ? "Pasifleştir" : "Aktifleştir"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
