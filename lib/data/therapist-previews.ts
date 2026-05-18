export type TherapistPreview = {
  id: string;
  name: string;
  role: string;
  initials: string;
  accentClass: string;
  gender: "male" | "female";
  specialties: string[];
  languages: string[];
  availability: string[];
  tone: string;
};
