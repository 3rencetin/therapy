export function deriveDisplayName(email: string | undefined, metadataName?: string): string {
  const trimmed = metadataName?.trim();
  if (trimmed) return trimmed.split(/\s+/).slice(0, 2).join(" ");
  if (!email) return "Siz";
  const local = email.split("@")[0] ?? "";
  if (!local) return "Siz";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned.length > 0 ? cleaned.replace(/\b\w/g, (c) => c.toUpperCase()) : "Siz";
}
