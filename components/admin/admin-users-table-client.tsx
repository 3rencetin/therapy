"use client";

import { Ban, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setProfileBannedAction } from "@/lib/actions/admin-profile-ban-actions";
import { repairTherapistStaffRowAction, updateProfileRoleAction } from "@/lib/actions/admin-user-role-actions";
import { ASSIGNABLE_PROFILE_ROLES, type AssignableProfileRole } from "@/lib/auth/app-role";
import type { AdminUserRow } from "@/lib/supabase/admin/admin-repository";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<AssignableProfileRole, string> = {
  user: "Kullanıcı",
  therapist: "Terapist",
  moderator: "Moderatör",
  admin: "Yönetici",
};

function roleBadgeClass(role: string): string {
  if (role === "admin") return "border-violet-400/25 bg-violet-500/10 text-violet-100/90";
  if (role === "moderator") return "border-sky-400/25 bg-sky-500/10 text-sky-100/90";
  if (role === "therapist") return "border-emerald-400/22 bg-emerald-500/10 text-emerald-100/90";
  return "border-border/50 bg-white/[0.03] text-muted-foreground";
}

export function AdminUsersTable({
  users,
  canManageRoles,
}: {
  users: AdminUserRow[];
  canManageRoles: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onRoleChange(userId: string, currentRole: string, next: string) {
    if (next === currentRole) return;
    setError(null);
    setBusyId(userId);
    start(async () => {
      const result = await updateProfileRoleAction(userId, next);
      setBusyId(null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function onBanToggle(userId: string, nextBanned: boolean) {
    setError(null);
    setBusyId(userId);
    start(async () => {
      const result = await setProfileBannedAction(userId, nextBanned);
      setBusyId(null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  function onRepairTherapistRow(userId: string) {
    setError(null);
    setBusyId(userId);
    start(async () => {
      const result = await repairTherapistStaffRowAction(userId);
      setBusyId(null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  const banned = (u: AdminUserRow) => u.banned_at != null && u.banned_at !== "";

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[0.8rem] text-red-100/90">{error}</p>
      ) : null}
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] shadow-[var(--shadow-glass)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[0.85rem]">
            <thead className="border-b border-border/45 bg-white/[0.02] text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Ad</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Hesap</th>
                <th className="px-4 py-3 font-medium">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/35">
              {users.map((u) => (
                <tr key={u.id} className="text-muted-foreground transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-foreground/90">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/90">{u.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    {canManageRoles ? (
                      <select
                        className={cn(
                          "max-w-[11rem] rounded-md border border-border/55 bg-background/90 px-2 py-1.5 text-[0.78rem] text-foreground outline-none ring-offset-background focus:ring-1 focus:ring-violet-400/35",
                          (pending || busyId === u.id) && "cursor-wait opacity-60",
                        )}
                        value={ASSIGNABLE_PROFILE_ROLES.includes(u.role as AssignableProfileRole) ? u.role : "user"}
                        disabled={pending || busyId !== null || banned(u)}
                        aria-label={`${u.email ?? u.id} rolü`}
                        onChange={(e) => onRoleChange(u.id, u.role, e.target.value)}
                      >
                        {ASSIGNABLE_PROFILE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {canManageRoles && u.role === "therapist" ? (
                      <button
                        type="button"
                        disabled={pending || busyId !== null || banned(u)}
                        className="mt-1.5 block text-left text-[0.7rem] text-violet-300/90 underline-offset-2 hover:underline disabled:opacity-40"
                        onClick={() => onRepairTherapistRow(u.id)}
                      >
                        Terapist satırını onar
                      </button>
                    ) : null}
                    {!canManageRoles ? (
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide",
                          roleBadgeClass(u.role),
                        )}
                      >
                        {ROLE_LABEL[u.role as AssignableProfileRole] ?? u.role}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[0.62rem] font-medium uppercase",
                          banned(u)
                            ? "border-red-400/30 bg-red-500/10 text-red-100/90"
                            : "border-border/50 bg-white/[0.03]",
                        )}
                      >
                        {banned(u) ? "Engelli" : "Aktif"}
                      </span>
                      {canManageRoles ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pending || busyId !== null}
                          className="h-8 gap-1.5 border-border/55 bg-transparent text-[0.72rem]"
                          onClick={() => onBanToggle(u.id, !banned(u))}
                        >
                          {banned(u) ? (
                            <>
                              <Undo2 className="size-3.5 opacity-80" strokeWidth={1.6} />
                              Engeli kaldır
                            </>
                          ) : (
                            <>
                              <Ban className="size-3.5 opacity-80" strokeWidth={1.6} />
                              Engelle
                            </>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[0.78rem]">{new Date(u.created_at).toLocaleDateString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
