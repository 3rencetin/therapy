import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import { TherapistProfileEditor } from "@/components/therapist/therapist-profile-editor";
import { TherapistUnlinkedPlaceholder } from "@/components/therapist/therapist-unlinked-placeholder";

export default async function TherapistProfilePage() {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);

  if (!staff) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <TherapistUnlinkedPlaceholder />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">Kamusal yüz</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">Profil düzenle</h1>
        <p className="text-[0.9rem] text-muted-foreground">
          Danışanların gördüğü bilgileri güncelle. Yönetim tarafından onaylandıktan sonra listenin tam listesinde
          görünürsün.
        </p>
      </header>
      <TherapistProfileEditor profile={staff} />
    </div>
  );
}
