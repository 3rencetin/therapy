"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";

export function DiscoveryEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-dashed border-border/55 bg-white/[0.02] px-8 py-16 text-center shadow-[var(--shadow-glass)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_50%_-20%,oklch(0.72_0.09_95/0.09),transparent_60%)]" />
      <div className="relative mx-auto max-w-md space-y-3">
        <p className="text-[0.72rem] tracking-[0.18em] text-muted-foreground/80 uppercase">Sakin bir boşluk</p>
        <h2 className="font-display text-[1.45rem] tracking-[-0.02em]">Bu filtrelerle eşleşen terapist yok</h2>
        <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
          Çerçeveyi genişletmek için filtreleri sıfırlayabilir veya eşleştirme sihirbazına dönebilirsin.
        </p>
        <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-center">
          <Button type="button" onClick={onReset} className="rounded-xl">
            Filtreleri sıfırla
          </Button>
          <Button asChild type="button" variant="outline" className="rounded-xl">
            <Link href="/onboarding" className="inline-flex items-center justify-center gap-2">
              <Compass className="size-4" />
              Eşleştirme
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
