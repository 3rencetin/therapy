import type { AppRole } from "@/lib/auth/app-role";

export function homePathForRole(role: AppRole): string {
  switch (role) {
    case "admin":
    case "moderator":
      return "/admin";
    case "therapist":
      return "/therapist";
    default:
      return "/dashboard";
  }
}

/** Başka platforma girildiyse kendi paneline yönlendirme URL'i; yoksa null. */
export function redirectIfCrossPlatform(pathname: string, role: AppRole): string | null {
  const home = homePathForRole(role);

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "moderator") {
    return home;
  }
  if (pathname.startsWith("/therapist") && role !== "therapist") {
    return home;
  }
  if (pathname.startsWith("/dashboard") && role !== "user") {
    return home;
  }
  if (pathname.startsWith("/onboarding") && role !== "user") {
    return home;
  }

  return null;
}
