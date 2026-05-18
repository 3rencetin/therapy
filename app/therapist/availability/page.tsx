import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOpenAvailabilityForProfile } from "@/lib/supabase/availability-repository";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import { TherapistAvailabilityEditor } from "@/components/therapist/therapist-availability-editor";
import { TherapistUnlinkedPlaceholder } from "@/components/therapist/therapist-unlinked-placeholder";
import { istanbulDateYmd } from "@/lib/i18n/datetime";
import { getServerTranslator } from "@/lib/i18n/server";
import { addDaysToYmd } from "@/lib/therapist/generate-availability-slots";

export default async function TherapistAvailabilityPage() {
  const { t } = await getServerTranslator();
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);

  if (!staff) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <TherapistUnlinkedPlaceholder />
      </div>
    );
  }

  const slots = await fetchOpenAvailabilityForProfile(supabase, staff.profile_id);
  const todayYmd = istanbulDateYmd();
  const defaultRangeEndYmd = addDaysToYmd(todayYmd, 14);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">{t("therapist.availability.kicker")}</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">{t("therapist.availability.title")}</h1>
        <p className="text-[0.9rem] text-muted-foreground">
          {t("therapist.availability.intro", { tz: t("therapist.availability.tz") })}
        </p>
      </header>
      <TherapistAvailabilityEditor initialSlots={slots} todayYmd={todayYmd} defaultRangeEndYmd={defaultRangeEndYmd} />
    </div>
  );
}
