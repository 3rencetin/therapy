import type { NextRequest } from "next/server";

import { applyLocaleCookie } from "@/lib/i18n/middleware-locale";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSupabaseSession(request);
  return applyLocaleCookie(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
