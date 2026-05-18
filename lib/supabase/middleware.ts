import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { normalizeAppRole, type AppRole } from "@/lib/auth/app-role";
import { homePathForRole, redirectIfCrossPlatform } from "@/lib/auth/home-for-role";

import { getSupabaseEnv } from "./urls";

import type { AppSupabaseClient } from "@/lib/supabase/app-client";

type CookieToSet = { name: string; value: string; options: CookieOptions };

type ProfileGate = {
  role: AppRole;
  bannedAt: string | null;
};

function requiresAuthentication(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/therapist") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/hesap-engellendi"
  );
}

function needsRoleResolution(pathname: string): boolean {
  return (
    requiresAuthentication(pathname) ||
    pathname === "/login" ||
    pathname === "/"
  );
}

/** Yasaklı hesap giriş yaptıktan sonra yalnızca bu yollar (ve auth akışı) kullanılabilir. */
function pathAllowedForBannedUser(pathname: string): boolean {
  return (
    pathname === "/hesap-engellendi" ||
    pathname === "/login" ||
    pathname === "/guven" ||
    pathname.startsWith("/auth/")
  );
}

async function resolveProfileGate(supabase: AppSupabaseClient, userId: string): Promise<ProfileGate> {
  try {
    const { data } = await supabase.from("profiles").select("role, banned_at").eq("id", userId).maybeSingle();
    return {
      role: normalizeAppRole(data?.role),
      bannedAt: data?.banned_at ?? null,
    };
  } catch {
    return { role: "user", bannedAt: null };
  }
}

export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const env = getSupabaseEnv();
  if (!env) {
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (requiresAuthentication(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const client = supabase as unknown as AppSupabaseClient;

  if (pathname === "/hesap-engellendi") {
    const gate = await resolveProfileGate(client, user.id);
    if (!gate.bannedAt) {
      const url = request.nextUrl.clone();
      url.pathname = homePathForRole(gate.role);
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (!needsRoleResolution(pathname)) {
    return response;
  }

  const gate = await resolveProfileGate(client, user.id);

  if (pathname === "/login") {
    if (!gate.bannedAt) {
      const url = request.nextUrl.clone();
      url.pathname = homePathForRole(gate.role);
      url.searchParams.delete("next");
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    if (gate.bannedAt) {
      url.pathname = "/hesap-engellendi";
    } else {
      url.pathname = homePathForRole(gate.role);
    }
    return NextResponse.redirect(url);
  }

  if (gate.bannedAt && !pathAllowedForBannedUser(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/hesap-engellendi";
    return NextResponse.redirect(url);
  }

  const role = gate.role;

  const cross = redirectIfCrossPlatform(pathname, role);
  if (cross) {
    const url = request.nextUrl.clone();
    url.pathname = cross;
    return NextResponse.redirect(url);
  }

  return response;
}
