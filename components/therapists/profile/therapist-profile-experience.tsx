"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  HeartHandshake,
  Languages,
  Sparkles,
  Stethoscope,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { TherapistAvailabilityRow, TherapistProfileRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { fadeUp, onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { therapistRowToPreview } from "@/lib/onboarding/derive-therapist-preview";
import { formatIstanbulDate, formatIstanbulTime } from "@/lib/i18n/datetime";
import { cn } from "@/lib/utils";

import { BookingFlowSheet } from "../booking/booking-flow-sheet";

function nextSlotsPreview(slots: TherapistAvailabilityRow[], limit: number): TherapistAvailabilityRow[] {
  return [...slots]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, limit);
}

export function TherapistProfileExperience({
  profile,
  openSlots,
}: {
  profile: TherapistProfileRow;
  openSlots: TherapistAvailabilityRow[];
}) {
  const router = useRouter();
  const [bookingOpen, setBookingOpen] = useState(false);
  const gender = profile.gender === "male" || profile.gender === "female" ? profile.gender : "female";
  const preview = therapistRowToPreview(profile, gender);
  const rating = Number(profile.rating);
  const displayRating = Number.isFinite(rating) ? rating.toFixed(1) : "—";

  const headlineSlots = useMemo(() => nextSlotsPreview(openSlots, 3), [openSlots]);

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.09] bg-[color-mix(in_oklch,var(--color-card),transparent_8%)] shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_12%_-20%,oklch(0.78_0.09_95/0.14),transparent_56%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_86%_30%,oklch(0.6_0.12_264/0.16),transparent_52%)]" />

        <div className="relative flex flex-col gap-8 p-7 sm:flex-row sm:items-end sm:justify-between sm:p-9">
          <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <div
              className={cn(
                "grid size-[5.75rem] shrink-0 place-items-center rounded-3xl font-display text-2xl tracking-tight text-white/95 ring-1 ring-white/10",
                preview.accentClass,
              )}
            >
              {preview.initials}
            </div>
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[0.7rem] tracking-[0.16em] text-muted-foreground/85 uppercase">Terapist</p>
                {profile.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/24 bg-emerald-500/10 px-2 py-0.5 text-[0.62rem] font-medium tracking-wide text-emerald-100/90 uppercase">
                    <BadgeCheck className="size-3.5" />
                    Doğrulanmış profil
                  </span>
                ) : null}
              </div>
              <h1 className="font-display text-[2rem] leading-[1.05] tracking-[-0.03em] text-balance sm:text-[2.35rem]">
                {profile.full_name}
              </h1>
              <p className="max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
                {profile.professional_title?.trim() ?? "Terapist"} ·{" "}
                <span className="text-foreground/88">{displayRating}</span> ortalama ·{" "}
                <span className="text-foreground/88">{profile.years_of_experience} yıl</span> deneyim
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="rounded-xl px-5" onClick={() => setBookingOpen(true)}>
                  Seans planla
                </Button>
                <Button asChild type="button" variant="outline" className="rounded-xl">
                  <Link href="/dashboard/therapists" className="inline-flex items-center gap-2">
                    <ArrowLeft className="size-4" />
                    Keşfe dön
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden w-full max-w-xs rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-[0.82rem] text-muted-foreground/92 shadow-[inset_0_1px_0_oklch(1_0_0/0.05)] sm:block">
            <p className="text-[0.62rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Güven</p>
            <p className="mt-2 leading-relaxed">
              Platform, yalnızca incelenmiş profilleri listeler. Bu alan klinik kayıt değil—sana özel, insani bir
              buluşma noktası.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.section
        variants={onboardingListContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-12%" }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            title: "Diller",
            body: preview.languages.join(" · ") || "—",
            icon: Languages,
          },
          {
            title: "Odak alanları",
            body: preview.specialties.slice(0, 4).join(" · ") || "—",
            icon: Stethoscope,
          },
          {
            title: "Tipik müsaitlik",
            body: preview.availability.join(" · ") || "—",
            icon: Timer,
          },
        ].map((item) => (
          <motion.div
            key={item.title}
            variants={onboardingListItem}
            className="rounded-[var(--radius-lg)] border border-border/55 bg-white/[0.025] p-5 shadow-[var(--shadow-glass)] backdrop-blur-[14px]"
          >
            <span className="grid size-10 place-items-center rounded-xl border border-border/55 bg-white/[0.04] text-muted-foreground">
              <item.icon className="size-5 stroke-[1.35]" />
            </span>
            <p className="mt-4 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {item.title}
            </p>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-foreground/90">{item.body}</p>
          </motion.div>
        ))}
      </motion.section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="space-y-4 rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-7 shadow-[var(--shadow-glass)] backdrop-blur-[14px]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">Hakkında</p>
              <h2 className="mt-1 font-display text-[1.4rem] tracking-[-0.02em]">Kendi cümleleriyle</h2>
            </div>
            <HeartHandshake className="size-6 text-muted-foreground/35" />
          </div>
          <p className="text-[0.95rem] leading-[1.75] text-muted-foreground/95">{profile.bio?.trim() || "—"}</p>
        </motion.div>

        <motion.aside
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="space-y-4 rounded-[var(--radius-xl)] border border-white/[0.09] bg-gradient-to-b from-white/[0.05] to-transparent p-7"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-5 text-amber-100/85" />
            <div>
              <p className="font-display text-[1.1rem] tracking-[-0.015em]">Yakın müsaitlik</p>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">
                İlk üç açık pencerenden birini seçebilir veya tam takvimi açabilirsin.
              </p>
            </div>
          </div>
          {headlineSlots.length === 0 ? (
            <p className="text-[0.86rem] text-muted-foreground">
              Takvim sakin—başka terapistlere göz atmak istersen keşif sayfasına dönebilirsin.
            </p>
          ) : (
            <ul className="space-y-2">
              {headlineSlots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border/45 bg-background/20 px-3 py-2 text-[0.82rem] text-muted-foreground"
                >
                  <span className="text-foreground">{formatIstanbulDate(s.starts_at)}</span>
                  <span>{formatIstanbulTime(s.starts_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <Button type="button" variant="subtle" className="w-full rounded-xl" onClick={() => setBookingOpen(true)}>
            Takvimi aç
          </Button>
        </motion.aside>
      </section>

      <BookingFlowSheet
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        therapistName={profile.full_name}
        slots={openSlots}
        onCompleted={() => router.refresh()}
      />
    </div>
  );
}
