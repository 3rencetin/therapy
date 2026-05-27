"use client";

import type { DashboardBootstrap } from "@/lib/dashboard/load-dashboard-data";
import { moodSnapshotForUser } from "@/lib/dashboard/mood-snapshot";
import {
  buildWelcomeSubtitle,
  insightParagraph,
} from "@/lib/dashboard/personalization";

import { useI18n } from "@/components/i18n/i18n-provider";

import { BreathingResetWidget } from "./breathing-reset-widget";
import { DashboardJourneySection } from "./sections/dashboard-journey-section";
import { DashboardMoodSection } from "./sections/dashboard-mood-section";
import { DashboardPrivacySection } from "./sections/dashboard-privacy-section";
import { DashboardSessionsSection } from "./sections/dashboard-sessions-section";
import { DashboardTherapistsSection } from "./sections/dashboard-therapists-section";
import { DashboardWellnessInsightSection } from "./sections/dashboard-wellness-insight-section";
import { DashboardWelcomeSection } from "./sections/dashboard-welcome-section";

export function DashboardHome({
  displayName,
  userId,
  bootstrap,
}: {
  displayName: string;
  userId: string;
  bootstrap: DashboardBootstrap;
}) {
  const { t } = useI18n();
  const welcomeSubtitle = buildWelcomeSubtitle(bootstrap.wizard, t);
  const insight = insightParagraph(bootstrap.wizard, t);
  const moods = moodSnapshotForUser(userId);

  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-20">
      <DashboardWelcomeSection displayName={displayName} subtitle={welcomeSubtitle} />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:items-start xl:gap-12">
        <div className="space-y-10">
          <DashboardTherapistsSection
            recommended={bootstrap.recommended}
            therapistTotal={bootstrap.therapistTotal}
          />
          <DashboardSessionsSection />
          <DashboardJourneySection />
        </div>
        <aside className="space-y-8 xl:sticky xl:top-20">
          <BreathingResetWidget />
          <DashboardMoodSection snapshots={moods} />
          <DashboardWellnessInsightSection text={insight} />
        </aside>
      </div>

      <DashboardPrivacySection />
    </div>
  );
}
