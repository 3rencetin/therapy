import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import type { AppSupabaseClient } from "./app-client";
import { getSupabaseEnv } from "./urls";

export function createSupabaseBrowserClient(): AppSupabaseClient {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. .env.example dosyasına bakarak NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini ayarlayın.",
    );
  }

  return createBrowserClient<Database>(env.url, env.anonKey) as unknown as AppSupabaseClient;
}
