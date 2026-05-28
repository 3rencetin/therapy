"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import type { TherapistProfileRow } from "@/types/database";
import {
  therapistUpdatePublicProfileAction,
  therapistUploadAvatarAction,
} from "@/lib/actions/therapist-workspace-actions";
import {
  THERAPIST_AVAILABILITY_TAG_OPTIONS,
  THERAPIST_LANGUAGE_OPTIONS,
  THERAPIST_SPECIALIZATION_OPTIONS,
  initialSelectionFromStored,
  sanitizeTherapistAvailabilityTags,
  sanitizeTherapistLanguages,
  sanitizeTherapistSpecialization,
} from "@/lib/therapist/profile-field-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

function ToggleChipGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly { readonly value: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-3 sm:col-span-2">
      <legend className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">{legend}</legend>
      <div className="max-h-[220px] overflow-y-auto rounded-xl border border-border/50 bg-white/[0.02] p-3 sm:max-h-[260px]">
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = selected.has(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-[0.82rem] transition-colors",
                  on
                    ? "border-violet-400/35 bg-violet-500/15 text-foreground"
                    : "border-border/45 bg-background/25 text-muted-foreground hover:border-border/70 hover:text-foreground",
                )}
              >
                {o.value}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[0.72rem] text-muted-foreground">
        Listeyi işaretleyerek seç; aynı etiket iki kez eklenmez. Müsaitlik etiketleri randevu saat dilimleriyle uyumludur.
      </p>
    </fieldset>
  );
}

export function TherapistProfileEditor({ profile }: { profile: TherapistProfileRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [avatarUploading, startAvatarUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [title, setTitle] = useState(profile.professional_title ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [gender, setGender] = useState<"male" | "female">(
    profile.gender === "male" || profile.gender === "female" ? profile.gender : "female",
  );
  const [langs, setLangs] = useState(() => initialSelectionFromStored(profile.languages, "lang"));
  const [specs, setSpecs] = useState(() => initialSelectionFromStored(profile.specialization, "spec"));
  const [avails, setAvails] = useState(() => initialSelectionFromStored(profile.availability, "avail"));
  const [years, setYears] = useState(String(profile.years_of_experience ?? 0));
  const [sessionMinutes, setSessionMinutes] = useState(String(profile.session_duration_minutes ?? 50));
  const [sessionFeeTry, setSessionFeeTry] = useState(String(profile.session_fee_try ?? 0));
  const [feedback, setFeedback] = useState<{ variant: "ok" | "err"; text: string } | null>(null);

  return (
    <form
      className="space-y-6 rounded-[var(--radius-xl)] border border-border/50 bg-white/[0.02] p-6 shadow-[var(--shadow-glass)]"
      onSubmit={(e) => {
        e.preventDefault();
        setFeedback(null);
        start(async () => {
          const y = Math.floor(Number.parseInt(years, 10));
          const mins = Math.floor(Number.parseInt(sessionMinutes, 10));
          const fee = Math.floor(Number.parseInt(sessionFeeTry, 10));
          const langArr = sanitizeTherapistLanguages(Array.from(langs), 12);
          const specArr = sanitizeTherapistSpecialization(Array.from(specs), 12);
          const availArr = sanitizeTherapistAvailabilityTags(Array.from(avails), 8);
          const res = await therapistUpdatePublicProfileAction({
            full_name: fullName,
            professional_title: title.trim() ? title.trim() : null,
            avatar_url: avatarUrl.trim() ? avatarUrl.trim() : null,
            bio,
            gender,
            languages: langArr,
            specialization: specArr,
            availability: availArr,
            years_of_experience: Number.isFinite(y) ? y : 0,
            session_duration_minutes: Number.isFinite(mins) ? mins : 50,
            session_fee_try: Number.isFinite(fee) ? fee : 0,
          });
          if (!res.ok) {
            setFeedback({ variant: "err", text: res.message });
            return;
          }
          setLangs(new Set(langArr));
          setSpecs(new Set(specArr));
          setAvails(new Set(availArr));
          setFeedback({ variant: "ok", text: "Profil kaydedildi." });
          router.refresh();
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">Profil fotoğrafı</Label>
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-2xl border border-border/60 bg-background/30">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Profil fotoğrafı" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[0.72rem] text-muted-foreground">Yok</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setFeedback(null);
                  startAvatarUpload(async () => {
                    const fd = new FormData();
                    fd.set("file", file);
                    const res = await therapistUploadAvatarAction(fd);
                    if (!res.ok) {
                      setFeedback({ variant: "err", text: res.message });
                      return;
                    }
                    setAvatarUrl(res.url);
                    setFeedback({ variant: "ok", text: "Profil fotoğrafı yüklendi." });
                  });
                  e.target.value = "";
                }}
              />
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()} disabled={avatarUploading}>
                <Upload className="size-4" />
                {avatarUploading ? "Yükleniyor…" : "Fotoğraf yükle"}
              </Button>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="min-w-[220px] rounded-xl bg-background/30"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="tp-name" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Görünen ad
          </Label>
          <Input
            id="tp-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl bg-background/30"
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tp-title" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Unvan
          </Label>
          <Input
            id="tp-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn. Klinik Psikolog"
            className="rounded-xl bg-background/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tp-gender" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Cinsiyet (eşleştirme için)
          </Label>
          <select
            id="tp-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            className="h-10 w-full rounded-xl border border-border/70 bg-background/30 px-3 text-[0.9rem] text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring/55"
          >
            <option value="female">Kadın</option>
            <option value="male">Erkek</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <ToggleChipGroup
            legend="Konuştuğun diller"
            options={THERAPIST_LANGUAGE_OPTIONS}
            selected={langs}
            onToggle={(v) => {
              setLangs((prev) => {
                const n = new Set(prev);
                if (n.has(v)) n.delete(v);
                else n.add(v);
                return n;
              });
            }}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <ToggleChipGroup
            legend="Uzmanlık alanları"
            options={THERAPIST_SPECIALIZATION_OPTIONS}
            selected={specs}
            onToggle={(v) => {
              setSpecs((prev) => {
                const n = new Set(prev);
                if (n.has(v)) n.delete(v);
                else n.add(v);
                return n;
              });
            }}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <ToggleChipGroup
            legend="Müsait zaman tercihleri (etiket)"
            options={THERAPIST_AVAILABILITY_TAG_OPTIONS}
            selected={avails}
            onToggle={(v) => {
              setAvails((prev) => {
                const n = new Set(prev);
                if (n.has(v)) n.delete(v);
                else n.add(v);
                return n;
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tp-yoe" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Deneyim (yıl)
          </Label>
          <Input
            id="tp-yoe"
            type="number"
            min={0}
            max={80}
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="rounded-xl bg-background/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tp-session-minutes" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Seans süresi (dk)
          </Label>
          <Input
            id="tp-session-minutes"
            type="number"
            min={15}
            max={180}
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(e.target.value)}
            className="rounded-xl bg-background/30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tp-session-fee" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
            Seans ücreti (TL)
          </Label>
          <Input
            id="tp-session-fee"
            type="number"
            min={0}
            step={50}
            value={sessionFeeTry}
            onChange={(e) => setSessionFeeTry(e.target.value)}
            className="rounded-xl bg-background/30"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tp-bio" className="text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground">
          Hakkında
        </Label>
        <textarea
          id="tp-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          placeholder="Yaklaşımını ve deneyimini kısaca anlat."
          className="w-full resize-y rounded-xl border border-border/70 bg-background/30 px-3.5 py-3 text-[0.9rem] text-foreground shadow-[0_1px_0_oklch(1_0_0/0.03)_inset] outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring/55"
        />
      </div>
      {feedback ? (
        <p
          className={cn(
            "text-[0.84rem]",
            feedback.variant === "ok" ? "text-emerald-100/95" : "text-rose-100/95",
          )}
        >
          {feedback.text}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="rounded-xl">
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}
