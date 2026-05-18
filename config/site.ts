export const siteConfig = {
  name: "Terapi",
  description: "Görüntülü görüşmelerle profesyonel terapistlere güvenli şekilde bağlanın.",
  url: "https://example.com",
  trustPoints: [
    { label: "Şifreli bağlantı", detail: "TLS (HTTPS) ile korunan oturum ve güvenli kimlik doğrulama." },
    { label: "Rol tabanlı erişim", detail: "Veriler satır düzeyinde ayrıştırılır; başka danışanların içeriği görünmez." },
    { label: "Doğrulanmış terapistler", detail: "Profiller yönetici onayından geçmeden herkese açık listelenmez." },
  ],
  headline: {
    lines: ["Sakin bir nefes.", "Güvenli bir bağ.", "Profesyonel bir eşlik."],
    kicker: "Çevrim içi terapi için yeni nesil platform",
  },
} as const;
