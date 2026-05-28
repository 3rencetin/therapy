"use server";

import { revalidatePath } from "next/cache";

import { clampNotebookBody, clampNotebookTitle } from "@/lib/sessions/notebook-limits";
import { fetchAvailabilitySlotById } from "@/lib/supabase/availability-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BookSessionResult =
  | { ok: true; sessionId: string }
  | { ok: false; code: "AUTH" | "SLOT" | "CONFLICT" | "UNKNOWN"; message: string };

export async function bookTherapistSessionAction(
  availabilityId: string,
  opts?: { initialNotebookTitle?: string; initialNotebookBody?: string; therapistCanView?: boolean },
): Promise<BookSessionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "AUTH", message: "Devam etmek için oturum açın." };
  }

  const slot = await fetchAvailabilitySlotById(supabase, availabilityId);
  if (!slot) {
    return { ok: false, code: "SLOT", message: "Bu zaman penceresi artık mevcut değil." };
  }

  if (new Date(slot.starts_at).getTime() <= Date.now()) {
    return { ok: false, code: "SLOT", message: "Geçmiş bir zaman dilimi seçilemez." };
  }

  const { data: inserted, error } = await supabase
    .from("booked_sessions")
    .insert({
      user_id: user.id,
      profile_id: slot.profile_id,
      availability_id: slot.id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      status: "confirmed",
      payment_status: "unpaid",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, code: "CONFLICT", message: "Bu seans birkaç saniye önce doldu. Başka bir saat seçin." };
    }
    return { ok: false, code: "UNKNOWN", message: "Rezervasyon tamamlanamadı. Biraz sonra yeniden deneyin." };
  }

  const nbTitle = opts?.initialNotebookTitle?.trim() ?? "";
  const nbBody = opts?.initialNotebookBody?.trim() ?? "";
  if (nbTitle || nbBody) {
    await supabase.from("booked_session_notebook_pages").insert({
      session_id: inserted.id,
      sort_order: 0,
      title: clampNotebookTitle(nbTitle || "Seans öncesi"),
      body: clampNotebookBody(nbBody),
      therapist_can_view: opts?.therapistCanView ?? true,
    });
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/therapists");
  revalidatePath(`/dashboard/therapists/${slot.profile_id}`);
  revalidatePath("/therapist/sessions");

  return { ok: true, sessionId: inserted.id };
}

export type CancelSessionResult = { ok: true } | { ok: false; code: "AUTH" | "UNKNOWN"; message: string };

export async function cancelTherapistSessionAction(sessionId: string): Promise<CancelSessionResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, code: "AUTH", message: "Oturum gerekli." };
  }

  const { data, error } = await supabase
    .from("booked_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .in("status", ["pending", "confirmed"])
    .select("id");

  if (error) {
    return { ok: false, code: "UNKNOWN", message: "İptal işlemi tamamlanamadı." };
  }

  if (!data?.length) {
    return { ok: false, code: "UNKNOWN", message: "Seans bulunamadı veya zaten güncellenmiş." };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/therapists");
  revalidatePath("/therapist/sessions");

  return { ok: true };
}
