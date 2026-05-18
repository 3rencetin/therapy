import { NextResponse, type NextRequest } from "next/server";

import { APP_LOCALE_COOKIE } from "@/lib/i18n/cookie";

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export function applyLocaleCookie(request: NextRequest, response: NextResponse): NextResponse {
  const param = request.nextUrl.searchParams.get("lang");
  if (param === "en" || param === "tr") {
    response.cookies.set(APP_LOCALE_COOKIE, param, COOKIE_OPTIONS);
    return response;
  }
  if (!request.cookies.get(APP_LOCALE_COOKIE)?.value) {
    const accept = request.headers.get("accept-language") ?? "";
    const fallback = /\ben([-_]|$)/i.test(accept) ? "en" : "tr";
    response.cookies.set(APP_LOCALE_COOKIE, fallback, COOKIE_OPTIONS);
  }
  return response;
}
