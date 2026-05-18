import Link from "next/link";
import { CalendarDays, Leaf, Sparkles } from "lucide-react";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import { fetchBookingsForTherapistProfile, therapistBookingClientLabel } from "@/lib/supabase/therapist-workspace-repository";
import { Button } from "@/components/ui/button";
import { formatIstanbulSessionWindow } from "@/lib/i18n/datetime";

export default async function TherapistHomePage() {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);

  if (!staff) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-8 text-center text-[0.9rem] text-muted-foreground">
        Henüz bir terapist profili bağlı değil. Yönetim, `therapist_profiles.user_id` alanını hesabınla eşlediğinde bu
        çalışma alanı aktifleşir.
      </div>
    );
  }

  const bookings = await fetchBookingsForTherapistProfile(supabase, staff.profile_id);
  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => new Date(b.starts_at).getTime() >= now && (b.status === "pending" || b.status === "confirmed"),
  );
  const past = bookings.filter((b) => new Date(b.ends_at).getTime() < now || b.status === "cancelled");

  const { count: slotCount } = await supabase
    .from("therapist_availability")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", staff.profile_id)
    .gt("starts_at", new Date().toISOString());

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header className="space-y-2">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Özet</p>
        <h1 className="font-display text-[1.9rem] tracking-[-0.03em]">Merhaba, {staff.full_name.split(/\s+/)[0]}</h1>
        <p className="max-w-xl text-[0.92rem] text-muted-foreground">
          Sakin bir çalışma yüzeyi—yaklaşan seansların ve müsaitlik özetin bir arada.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild className="rounded-xl">
            <Link href="/therapist/sessions">Seanslar</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/therapist/availability">Müsaitlik</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            <CalendarDays className="size-4" />
            Yaklaşan seans
          </div>
          <p className="mt-3 font-display text-3xl tabular-nums">{upcoming.length}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            <Leaf className="size-4" />
            Açık slot
          </div>
          <p className="mt-3 font-display text-3xl tabular-nums">{slotCount ?? 0}</p>
          <p className="mt-1 text-[0.72rem] text-muted-foreground/80">Gelecekte listelenen dilimler</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.025] p-6 shadow-[var(--shadow-glass)]">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-4" />
            Tamamlanan / arşiv
          </div>
          <p className="mt-3 font-display text-3xl tabular-nums">{past.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-xl tracking-[-0.02em]">Sıradaki buluşmalar</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/55 bg-white/[0.02] px-5 py-12 text-center text-[0.9rem] text-muted-foreground">
            Yaklaşan seans yok — müsaitlik ekleyerek davet edebilirsin.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 5).map((b) => {
              const headline = therapistBookingClientLabel(b);
              const email = b.client?.email?.trim() ?? "";
              return (
                <li
                  key={b.id}
                  className="flex flex-col justify-between gap-2 rounded-xl border border-border/45 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <span className="block text-[0.88rem] font-medium text-foreground/95">{headline}</span>
                    {email && email !== headline ? (
                      <span className="mt-0.5 block text-[0.72rem] text-muted-foreground">{email}</span>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[0.85rem] text-muted-foreground">
                    {formatIstanbulSessionWindow(b.starts_at, b.ends_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-6">
        <p className="font-display text-lg tracking-[-0.02em]">Bugün için</p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-[0.88rem] leading-relaxed text-muted-foreground">
          <li>
            <Link href="/therapist/profile" className="text-foreground/90 underline-offset-4 hover:underline">
              Profil
            </Link>
            üzerinden dil, uzmanlık ve görünen bilgilerini güncelle.
          </li>
          <li>
            <Link href="/therapist/availability" className="text-foreground/90 underline-offset-4 hover:underline">
              Müsaitlik
            </Link>
            e geçerek danışanların seçebileceği saat dilimlerini ekle.
          </li>
          <li>Onay bekliyorsan yönetim ekibi doğruladığında listen tam sürümde görünür.</li>
        </ul>
      </section>
    </div>
  );
}
