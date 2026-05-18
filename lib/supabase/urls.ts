function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
  restUrl: string;
};

/**
 * Tarayıcı ve sunucu tarafında ortak PostgREST kökü + Auth API tabanı.
 * REST kökü verilmezse `SUPABASE_URL/rest/v1` türetilir.
 */
export function getSupabaseEnv(): PublicSupabaseEnv | null {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!urlRaw || !anonKey) {
    return null;
  }

  const url = trimTrailingSlashes(urlRaw);
  const restRaw = process.env.NEXT_PUBLIC_SUPABASE_REST_URL;
  const restUrl = trimTrailingSlashes(restRaw ?? `${url}/rest/v1`);

  return { url, anonKey, restUrl };
}

export function getSupabaseUrl(): string {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY gerekli.",
    );
  }
  return env.url;
}

export function getSupabaseRestUrl(): string {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. REST istekleri için URL ve anon anahtar tanımlı olmalı.",
    );
  }
  return env.restUrl;
}

/** Örn. `profiles` veya `profiles?id=eq.1` → tam PostgREST URL */
export function supabaseRestPath(resourcePath: string): string {
  const base = getSupabaseRestUrl();
  const path = resourcePath.replace(/^\//, "");
  return `${base}/${path}`;
}

/** Doğrudan `fetch` ile PostgREST çağrıları için (anon rolü) */
export function supabaseAnonHeadersInit(): HeadersInit {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase ortam değişkenleri eksik. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY gerekli.",
    );
  }
  return {
    apikey: env.anonKey,
    Authorization: `Bearer ${env.anonKey}`,
  };
}
