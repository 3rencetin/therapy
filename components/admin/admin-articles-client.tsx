"use client";

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { formatGuideDate } from "@/lib/articles/format-date";
import type { GuideArticleRow } from "@/lib/supabase/articles-repository";

export function AdminArticlesClient({ articles }: { articles: GuideArticleRow[] }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild className="rounded-xl">
          <Link href="/admin/rehber/new">
            <Plus className="size-4" />
            {t("admin.guide.newArticle")}
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-[0.85rem]">
          <thead className="border-b border-border bg-muted/40 text-[0.72rem] tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">{t("admin.guide.colTitle")}</th>
              <th className="hidden px-4 py-3 sm:table-cell">{t("admin.guide.colCategory")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{t("admin.guide.colStatus")}</th>
              <th className="hidden px-4 py-3 lg:table-cell">{t("admin.guide.colDate")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {t("admin.guide.empty")}
                </td>
              </tr>
            ) : (
              articles.map((a) => (
                <tr key={a.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="text-[0.75rem] text-muted-foreground">/{a.slug}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">{a.category}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={
                        a.status === "published"
                          ? "text-[#1B7A36]"
                          : a.status === "draft"
                            ? "text-muted-foreground"
                            : "text-[#C41E12]"
                      }
                    >
                      {a.status === "published"
                        ? t("admin.guide.statusPublished")
                        : a.status === "draft"
                          ? t("admin.guide.statusDraft")
                          : t("admin.guide.statusArchived")}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatGuideDate(a.published_at ?? a.updated_at, locale)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-lg">
                      <Link href={`/admin/rehber/${a.id}/edit`}>
                        <Pencil className="size-3.5" />
                        {t("admin.guide.edit")}
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
