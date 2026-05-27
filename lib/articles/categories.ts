export const GUIDE_CATEGORIES = [
  "Yalnızlık",
  "Çocuk gelişimi",
  "Anksiyete",
  "İlişkiler",
  "Ebeveynlik",
  "Travma ve iyileşme",
  "Öz bakım",
  "Terapi süreci",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
