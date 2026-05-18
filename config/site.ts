export const siteConfig = {
  name: "Terapi",
  description: "Görüntülü görüşmelerle profesyonel terapistlere güvenli şekilde bağlanın.",
  url: "https://example.com",
  trustPoints: [
    { label: "Uçtan uca şifreleme", detail: "Oturumlarınız tasarımdan itibaren korunur." },
    { label: "Lisanslı uzmanlar", detail: "Her terapist kimlik ve yetki kontrolünden geçer." },
    { label: "Klinik süpervizyon", detail: "Kalite ve etik standartlar sürekli izlenir." },
  ],
  headline: {
    lines: ["Sakin bir nefes.", "Güvenli bir bağ.", "Profesyonel bir eşlik."],
    kicker: "Çevrim içi terapi için yeni nesil platform",
  },
} as const;
