import type { Metadata } from "next";

import { JourneyHub } from "@/components/journey/journey-hub";

export const metadata: Metadata = {
  title: "Yolculuk",
  description: "Duygusal güven ve nazik ritüeller için alan.",
};

export default function JourneyPage() {
  return <JourneyHub />;
}
