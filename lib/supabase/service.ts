import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabaseUrl } from "./urls";

/** Sunucu tarafı — RLS bypass (yalnızca admin doğrulamasından sonra kullanın). */
export function createSupabaseServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY veya SUPABASE_SECRET_KEY tanımlı değil.");
  }
  return createClient<Database>(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
