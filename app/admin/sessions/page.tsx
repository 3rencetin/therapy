import { fetchAdminRecentSessions } from "@/lib/supabase/admin/admin-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";

export default async function AdminSessionsPage() {
  const supabase = await createSupabaseServerClient();
  const rows = await fetchAdminRecentSessions(supabase, 80);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Plan</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">Seans dizini</h1>
        <p className="text-[0.9rem] text-muted-foreground">Tüm rezervasyon kayıtları — salt okunur yönetici görünümü.</p>
      </header>
      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] shadow-[var(--shadow-glass)]">
        <ul className="divide-y divide-border/40">
          {rows.length === 0 ? (
            <li className="px-5 py-14 text-center text-muted-foreground">Kayıt yok.</li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-[0.9rem] text-foreground">{row.therapist_profiles?.full_name ?? "Terapist"}</p>
                  <p className="font-mono text-[0.72rem] text-muted-foreground">Danışan {row.user_id.slice(0, 8)}…</p>
                </div>
                <div className="text-left text-[0.82rem] text-muted-foreground sm:text-right">
                  <p>{formatIstanbulSessionWindow(row.starts_at, row.ends_at)}</p>
                  <p className="text-[0.7rem] uppercase tracking-[0.12em]">
                    {row.status} · ödeme {row.payment_status}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
