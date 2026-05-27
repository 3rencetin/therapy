"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { TherapistProfileRow } from "@/types/database";
import { softSpring } from "@/lib/animations/easing";
import { therapistRowToPreview } from "@/lib/onboarding/derive-therapist-preview";
import { cn } from "@/lib/utils";

export function TherapistPremiumCard({
  profile,
  featured,
  variant,
  href,
}: {
  profile: TherapistProfileRow;
  featured?: boolean;
  variant: "hero" | "compact";
  href?: string;
}) {
  const gender = profile.gender === "male" || profile.gender === "female" ? profile.gender : "female";
  const preview = therapistRowToPreview(profile, gender);
  const rating = Number(profile.rating);
  const displayRating = Number.isFinite(rating) ? rating.toFixed(1) : "—";

  const body: ReactNode = (
    <motion.article
      layout
      whileHover={{ y: -3, transition: softSpring }}
      className={cn(
        "group relative overflow-hidden surface-premium rounded-[var(--radius-xl)]",
        featured && "border-[#007AFF44] ring-1 ring-[#007AFF22]",
        variant === "hero" ? "p-6 sm:p-7" : "p-5",
        href && "transition-[box-shadow,transform] duration-300",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_circle_at_var(--rx,20%)_-10%,#007AFF18,transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div
        className={cn(
          "relative flex gap-5",
          variant === "compact" ? "flex-col sm:flex-row sm:items-start" : "flex-col sm:flex-row sm:items-center",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl font-display text-xl tracking-tight text-white/90",
            preview.accentClass,
            variant === "hero" ? "size-[5.25rem] sm:size-[5.75rem]" : "size-[4.5rem]",
          )}
        >
          {preview.initials}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-[1.2rem] tracking-[-0.02em] text-foreground sm:text-[1.28rem]">
                  {profile.full_name}
                </h3>
                {profile.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-emerald-200/90 uppercase">
                    <ShieldCheck className="size-3" strokeWidth={2} />
                    Doğrulandı
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-[0.875rem] text-muted-foreground">
                {profile.professional_title?.trim() || "Terapist"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[0.8125rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1 text-foreground/90">
                <Star className="size-3.5 text-amber-200/80" strokeWidth={1.5} />
                {displayRating}
              </span>
              <span className="rounded-lg border border-border bg-muted px-2 py-1">
                {profile.years_of_experience} yıl
              </span>
            </div>
          </div>

          <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-muted-foreground/92">{preview.tone}</p>

          <div className="flex flex-wrap gap-1.5">
            {preview.specialties.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-[0.68rem] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-border/35 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[0.78rem] text-muted-foreground/90">
              <span className="text-muted-foreground/55">Diller · </span>
              {preview.languages.join(" · ")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preview.availability.map((slot) => (
                <span
                  key={slot}
                  className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[0.68rem] text-muted-foreground"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-[var(--radius-xl)] outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {body}
    </Link>
  );
}
