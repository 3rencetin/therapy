import type { DashboardBootstrap } from "@/lib/dashboard/load-dashboard-data";

export type ActivityEntry = {
  id: string;
  title: string;
  description: string;
  at: string;
  tone: "soft" | "neutral";
};

export function buildActivityTimeline(b: DashboardBootstrap): ActivityEntry[] {
  const items: ActivityEntry[] = [];

  if (b.onboardingCompletedAt) {
    items.push({
      id: "complete",
      title: "Eşleştirme adımları tamamlandı",
      description: "Tercihleriniz kaydedildi; öneriler bu doğrultuda şekilleniyor.",
      at: b.onboardingCompletedAt,
      tone: "soft",
    });
  }

  if (b.onboardingUpdatedAt) {
    items.push({
      id: "update",
      title: "Profil tercihleri güncellendi",
      description: "Son yanıtlarınız akış ve önerilerle senkron.",
      at: b.onboardingUpdatedAt,
      tone: "neutral",
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 6);
}
