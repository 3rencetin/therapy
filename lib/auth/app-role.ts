export type AppRole = "user" | "therapist" | "moderator" | "admin";

/** Admin panelinden atanabilen profil rolleri (DB ile uyumlu). */
export const ASSIGNABLE_PROFILE_ROLES = ["user", "therapist", "moderator", "admin"] as const;

export type AssignableProfileRole = (typeof ASSIGNABLE_PROFILE_ROLES)[number];

export function normalizeAppRole(value: string | null | undefined): AppRole {
  if (value === "admin" || value === "therapist" || value === "moderator" || value === "user") {
    return value;
  }
  return "user";
}

export function isAssignableProfileRole(value: string): value is AssignableProfileRole {
  return (ASSIGNABLE_PROFILE_ROLES as readonly string[]).includes(value);
}
