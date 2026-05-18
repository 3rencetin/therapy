import type { Metadata } from "next";

import { TrustCenterContent } from "@/components/trust/trust-center-content";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("trust.metaTitle"),
    description: t("trust.metaDescription"),
  };
}

export default function GuvenPage() {
  return <TrustCenterContent />;
}
