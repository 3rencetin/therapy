"use server";

import { revalidatePath } from "next/cache";

import {
  buildGuideCoverPath,
  GUIDE_COVER_MAX_BYTES,
  resolveGuideCoverContentType,
} from "@/lib/articles/cover-upload";
import { slugifyTitle } from "@/lib/articles/slug";
import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ArticleFormInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  body: string;
  coverImageUrl: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
};

function parseTags(raw: string): string[] {
  return raw
    .split(/[,#]/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeSlug(raw: string, title: string): string {
  const base = slugifyTitle(raw.trim() || title);
  return base || `makale-${Date.now()}`;
}

export async function saveGuideArticleAction(
  input: ArticleFormInput,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  const title = input.title.trim();
  if (title.length < 3) return { ok: false, message: "TITLE_TOO_SHORT" };

  const slug = normalizeSlug(input.slug, title);
  const excerpt = input.excerpt.trim();
  const category = input.category.trim();
  const body = input.body.trim();
  if (!category) return { ok: false, message: "CATEGORY_REQUIRED" };
  if (!body) return { ok: false, message: "BODY_REQUIRED" };

  const publishedAt =
    input.status === "published" ? new Date().toISOString() : null;

  const row = {
    title,
    slug,
    excerpt,
    category,
    tags: parseTags(input.tags),
    body,
    cover_image_url: input.coverImageUrl.trim() || null,
    status: input.status,
    is_featured: input.isFeatured,
    published_at: publishedAt,
    author_id: ctx.user.id,
  };

  if (input.id && UUID_RE.test(input.id)) {
    const { error } = await supabase.from("guide_articles").update(row).eq("id", input.id);
    if (error) {
      if (error.code === "23505") return { ok: false, message: "SLUG_EXISTS" };
      return { ok: false, message: error.message };
    }
    revalidateGuide();
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase.from("guide_articles").insert(row).select("id").single();
  if (error) {
    if (error.code === "23505") return { ok: false, message: "SLUG_EXISTS" };
    return { ok: false, message: error.message };
  }

  revalidateGuide();
  return { ok: true, id: data.id };
}

export async function deleteGuideArticleAction(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole("admin");
  if (!UUID_RE.test(id)) return { ok: false, message: "INVALID_ID" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("guide_articles").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };

  revalidateGuide();
  return { ok: true };
}

export async function uploadArticleCoverAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  await requireRole("admin");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "NO_FILE" };
  }
  if (file.size > GUIDE_COVER_MAX_BYTES) {
    return { ok: false, message: "FILE_TOO_LARGE" };
  }

  const { path, ext } = buildGuideCoverPath(file.name);
  const contentType = resolveGuideCoverContentType(file, ext);

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.storage.from("article-covers").upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    console.error("[uploadArticleCoverAction]", error.message);
    return { ok: false, message: error.message };
  }

  const objectPath = data?.path ?? path;
  const { data: urlData } = supabase.storage.from("article-covers").getPublicUrl(objectPath);
  return { ok: true, url: urlData.publicUrl };
}

function revalidateGuide() {
  revalidatePath("/admin/rehber");
  revalidatePath("/dashboard/rehber");
}
