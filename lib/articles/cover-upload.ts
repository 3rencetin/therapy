import type { AppSupabaseClient } from "@/lib/supabase/app-client";

export const GUIDE_COVER_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function randomSuffix(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function buildGuideCoverPath(fileName: string): { path: string; ext: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ALLOWED_EXT.has(ext) ? ext : "jpg";
  const path = `${Date.now()}-${randomSuffix()}.${safeExt}`;
  return { path, ext: safeExt };
}

/** Admin panel — service role ile güvenilir yükleme. */
export async function uploadGuideCoverViaApi(
  file: File,
): Promise<GuideCoverUploadResult> {
  if (!file.size) return { ok: false, code: "NO_FILE", message: "NO_FILE" };
  if (file.size > GUIDE_COVER_MAX_BYTES) {
    return { ok: false, code: "FILE_TOO_LARGE", message: "FILE_TOO_LARGE" };
  }

  const fd = new FormData();
  fd.set("file", file);

  let res: Response;
  try {
    res = await fetch("/api/admin/guide-cover", { method: "POST", body: fd });
  } catch (e) {
    const message = e instanceof Error ? e.message : "NETWORK_ERROR";
    return { ok: false, code: "UPLOAD_FAILED", message };
  }

  let payload: { ok?: boolean; url?: string; message?: string };
  try {
    payload = (await res.json()) as { ok?: boolean; url?: string; message?: string };
  } catch {
    return { ok: false, code: "UPLOAD_FAILED", message: `HTTP_${res.status}` };
  }

  if (!res.ok || !payload.ok || !payload.url) {
    return {
      ok: false,
      code: "UPLOAD_FAILED",
      message: payload.message ?? `HTTP_${res.status}`,
    };
  }

  return { ok: true, url: payload.url };
}

export function resolveGuideCoverContentType(file: File, ext: string): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] ?? "image/jpeg";
}

export type GuideCoverUploadResult =
  | { ok: true; url: string }
  | { ok: false; code: "NO_FILE" | "FILE_TOO_LARGE" | "UPLOAD_FAILED"; message: string };

export async function uploadGuideCover(
  supabase: AppSupabaseClient,
  file: File,
): Promise<GuideCoverUploadResult> {
  if (!file.size) return { ok: false, code: "NO_FILE", message: "NO_FILE" };
  if (file.size > GUIDE_COVER_MAX_BYTES) {
    return { ok: false, code: "FILE_TOO_LARGE", message: "FILE_TOO_LARGE" };
  }

  const { path, ext } = buildGuideCoverPath(file.name);
  const contentType = resolveGuideCoverContentType(file, ext);

  const { error } = await supabase.storage.from("article-covers").upload(path, file, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    return { ok: false, code: "UPLOAD_FAILED", message: error.message };
  }

  const { data } = supabase.storage.from("article-covers").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export function mapGuideCoverUploadError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("row-level security") || lower.includes("policy")) {
    return "UPLOAD_FORBIDDEN";
  }
  if (lower.includes("bucket") && lower.includes("not found")) {
    return "UPLOAD_BUCKET_MISSING";
  }
  if (lower.includes("mime") || lower.includes("not allowed")) {
    return "UPLOAD_MIME";
  }
  return message;
}
