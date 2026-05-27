"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GUIDE_CATEGORIES } from "@/lib/articles/categories";
import { mapGuideCoverUploadError } from "@/lib/articles/cover-upload";
import { slugifyTitle } from "@/lib/articles/slug";
import {
  deleteGuideArticleAction,
  saveGuideArticleAction,
  uploadArticleCoverAction,
  type ArticleFormInput,
} from "@/lib/actions/admin-article-actions";
import type { GuideArticleRow } from "@/lib/supabase/articles-repository";

const ERR_MAP: Record<string, string> = {
  TITLE_TOO_SHORT: "admin.guide.errTitle",
  CATEGORY_REQUIRED: "admin.guide.errCategory",
  BODY_REQUIRED: "admin.guide.errBody",
  SLUG_EXISTS: "admin.guide.errSlug",
  NO_FILE: "admin.guide.errNoFile",
  FILE_TOO_LARGE: "admin.guide.errFileSize",
  UPLOAD_FORBIDDEN: "admin.guide.errUploadForbidden",
  UPLOAD_BUCKET_MISSING: "admin.guide.errUploadBucket",
  UPLOAD_MIME: "admin.guide.errUploadMime",
  UPLOAD_FAILED: "admin.guide.errUploadFailed",
};

function formatUploadError(message: string, t: (key: string) => string): string {
  if (message === "NO_FILE" || message === "FILE_TOO_LARGE") {
    const key = ERR_MAP[message];
    return key ? t(key) : message;
  }
  const code = mapGuideCoverUploadError(message);
  const key = ERR_MAP[code] ?? ERR_MAP.UPLOAD_FAILED;
  return key ? t(key) : message;
}

export function ArticleEditorForm({ article }: { article?: GuideArticleRow | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadHint, setUploadHint] = useState<string | null>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState(article?.category ?? GUIDE_CATEGORIES[0]);
  const [tags, setTags] = useState(article?.tags?.join(", ") ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverUrl, setCoverUrl] = useState(article?.cover_image_url ?? "");
  const [coverPreview, setCoverPreview] = useState<string | null>(article?.cover_image_url ?? null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    (article?.status as "draft" | "published" | "archived") ?? "draft",
  );
  const [isFeatured, setIsFeatured] = useState(article?.is_featured ?? false);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  function setBlobPreview(file: File) {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const blob = URL.createObjectURL(file);
    blobUrlRef.current = blob;
    setCoverPreview(blob);
  }

  function uploadCoverFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      startUpload(async () => {
        const fd = new FormData();
        fd.set("file", file);
        const res = await uploadArticleCoverAction(fd);
        if (!res.ok) {
          setError(formatUploadError(res.message, t));
          setUploadHint(null);
          resolve(null);
          return;
        }
        setCoverUrl(res.url);
        setCoverPreview(res.url);
        setPendingCoverFile(null);
        setUploadHint(t("admin.guide.uploadSuccess"));
        setError(null);
        resolve(res.url);
      });
    });
  }

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugifyTitle(v));
  }

  function onPickCoverFile(file: File) {
    setError(null);
    setUploadHint(null);
    setPendingCoverFile(file);
    setBlobPreview(file);
    void uploadCoverFile(file);
  }

  async function ensureCoverUrl(): Promise<string> {
    if (coverUrl.trim()) return coverUrl.trim();
    if (pendingCoverFile) {
      const uploaded = await uploadCoverFile(pendingCoverFile);
      if (uploaded) return uploaded;
    }
    return "";
  }

  function submit(nextStatus: ArticleFormInput["status"]) {
    setError(null);
    startTransition(async () => {
      const finalCover = await ensureCoverUrl();
      const input: ArticleFormInput = {
        id: article?.id,
        title,
        slug,
        excerpt,
        category,
        tags,
        body,
        coverImageUrl: finalCover,
        status: nextStatus,
        isFeatured,
      };
      const res = await saveGuideArticleAction(input);
      if (!res.ok) {
        const key = ERR_MAP[res.message];
        setError(key ? t(key) : res.message);
        return;
      }
      router.push("/admin/rehber");
      router.refresh();
    });
  }

  function onDelete() {
    if (!article?.id) return;
    if (!window.confirm(t("admin.guide.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteGuideArticleAction(article.id);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.push("/admin/rehber");
      router.refresh();
    });
  }

  const previewSrc = coverPreview || coverUrl;
  const isUploading = uploading;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">{t("admin.guide.editorKicker")}</p>
          <h1 className="font-display text-[1.75rem] tracking-[-0.03em]">
            {article ? t("admin.guide.editTitle") : t("admin.guide.newTitle")}
          </h1>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/rehber">{t("admin.guide.backList")}</Link>
        </Button>
      </header>

      <div className="surface-premium space-y-6 rounded-[var(--radius-xl)] p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">{t("admin.guide.fieldTitle")}</Label>
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">{t("admin.guide.fieldSlug")}</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="h-11 font-mono text-[0.85rem]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("admin.guide.fieldCategory")}</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-input px-3.5 text-[0.9rem]"
            >
              {GUIDE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">{t("admin.guide.fieldExcerpt")}</Label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-[0.9rem] leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{t("admin.guide.fieldTags")}</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#yalnizlik, psikoloji" />
        </div>

        <div className="space-y-3">
          <Label htmlFor="cover-file">{t("admin.guide.fieldCover")}</Label>
          {previewSrc ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="" className="aspect-[16/7] w-full object-cover" />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="cover-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickCoverFile(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={isUploading}
              onClick={() => fileRef.current?.click()}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isUploading ? t("admin.guide.uploading") : t("admin.guide.uploadCover")}
            </Button>
            <Input
              value={coverUrl}
              onChange={(e) => {
                setCoverUrl(e.target.value);
                setCoverPreview(e.target.value.trim() || null);
                setPendingCoverFile(null);
                setUploadHint(null);
              }}
              placeholder="https://..."
              className="min-w-[200px] flex-1"
            />
          </div>
          {pendingCoverFile && !isUploading ? (
            <p className="text-[0.8rem] text-muted-foreground">
              {t("admin.guide.selectedFile", { name: pendingCoverFile.name })}
            </p>
          ) : null}
          {isUploading ? <p className="text-[0.8rem] text-muted-foreground">{t("admin.guide.uploadingHint")}</p> : null}
          {uploadHint ? <p className="text-[0.8rem] text-[#248A3D]">{uploadHint}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">{t("admin.guide.fieldBody")}</Label>
          <p className="text-[0.75rem] text-muted-foreground">{t("admin.guide.bodyHint")}</p>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-3 font-mono text-[0.88rem] leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[0.85rem]">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            {t("admin.guide.fieldFeatured")}
          </label>
          <div className="space-y-1">
            <Label htmlFor="status">{t("admin.guide.fieldStatus")}</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="h-10 rounded-xl border border-border bg-input px-3 text-[0.85rem]"
            >
              <option value="draft">{t("admin.guide.statusDraft")}</option>
              <option value="published">{t("admin.guide.statusPublished")}</option>
              <option value="archived">{t("admin.guide.statusArchived")}</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-[0.85rem] text-[#C41E12]">{error}</p> : null}

        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-5">
          <Button type="button" disabled={pending || isUploading} onClick={() => submit("published")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("admin.guide.publish")}
          </Button>
          <Button type="button" variant="outline" disabled={pending || isUploading} onClick={() => submit("draft")}>
            {t("admin.guide.saveDraft")}
          </Button>
          {article?.id ? (
            <Button type="button" variant="outline" className="text-[#C41E12]" disabled={pending} onClick={onDelete}>
              <Trash2 className="size-4" />
              {t("admin.guide.delete")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
