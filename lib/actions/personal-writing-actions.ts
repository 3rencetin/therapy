"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveJournalEntryAction(input: {
  entryDate: string;
  title: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Oturum gerekli." };

  const { error } = await supabase.from("user_journal_entries").upsert(
    {
      user_id: user.id,
      entry_date: input.entryDate,
      title: input.title.trim().slice(0, 200),
      body: input.body.trim().slice(0, 50000),
    },
    { onConflict: "user_id,entry_date" },
  );
  if (error) return { ok: false, message: "Günlük kaydedilemedi." };
  revalidatePath("/dashboard/gunluk");
  return { ok: true };
}

export async function createUserNoteAction(input: {
  noteDate: string;
  title: string;
  body: string;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Oturum gerekli." };

  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: user.id,
      note_date: input.noteDate,
      title: input.title.trim().slice(0, 200),
      body: input.body.trim().slice(0, 50000),
    })
    .select("id")
    .single();
  if (error) return { ok: false, message: "Not eklenemedi." };
  revalidatePath("/dashboard/notlar");
  return { ok: true, id: data.id };
}

export async function updateUserNoteAction(input: {
  id: string;
  noteDate: string;
  title: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Oturum gerekli." };

  const { error } = await supabase
    .from("user_notes")
    .update({
      note_date: input.noteDate,
      title: input.title.trim().slice(0, 200),
      body: input.body.trim().slice(0, 50000),
    })
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: "Not güncellenemedi." };
  revalidatePath("/dashboard/notlar");
  return { ok: true };
}

export async function deleteUserNoteAction(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Oturum gerekli." };

  const { error } = await supabase.from("user_notes").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, message: "Not silinemedi." };
  revalidatePath("/dashboard/notlar");
  return { ok: true };
}
