import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TherapistProfileExperience } from "@/components/therapists/profile/therapist-profile-experience";
import { fetchOpenAvailabilityForProfile } from "@/lib/supabase/availability-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistProfileById } from "@/lib/supabase/therapist-repository";

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const profile = await fetchTherapistProfileById(supabase, id).catch(() => null);
  if (!profile) {
    return { title: "Terapist" };
  }
  return {
    title: `${profile.full_name}`,
    description: profile.professional_title ?? "Doğrulanmış terapist profili",
  };
}

export default async function TherapistDetailPage(props: PageProps) {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const profile = await fetchTherapistProfileById(supabase, id);
  if (!profile) {
    notFound();
  }

  const openSlots = await fetchOpenAvailabilityForProfile(supabase, id).catch(() => []);

  return <TherapistProfileExperience profile={profile} openSlots={openSlots} />;
}
