import { redirect } from "next/navigation";

import { JournalEditor } from "@/components/dashboard/journal-editor";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardJournalPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("user_journal_entries")
    .select("id, entry_date, title, body, updated_at")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(90);

  return <JournalEditor initialEntries={data ?? []} />;
}
