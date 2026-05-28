import { redirect } from "next/navigation";

import { NotesEditor } from "@/components/dashboard/notes-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardNotesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("user_notes")
    .select("id, note_date, title, body, updated_at")
    .eq("user_id", user.id)
    .order("note_date", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(120);

  return <NotesEditor initialNotes={data ?? []} />;
}
