import { fetchAdminTherapists } from "@/lib/supabase/admin/admin-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TherapistsModerationTable } from "@/components/admin/therapists-moderation-client";

export default async function AdminTherapistsPage() {
  const supabase = await createSupabaseServerClient();
  const therapists = await fetchAdminTherapists(supabase);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Moderasyon</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">Terapist onayları</h1>
        <p className="max-w-2xl text-[0.9rem] text-muted-foreground">
          Doğrulama ve aktiflik bayrakları dizin görünürlüğünü (RLS) doğrudan etkiler. Terapist hesabı için
          `profiles.role` + `therapist_profiles.user_id` eşlemesi gerekir.
        </p>
      </header>
      <TherapistsModerationTable therapists={therapists} />
    </div>
  );
}
