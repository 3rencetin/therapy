# Therapy

Çevrim içi terapi platformu için **Next.js 15** ve **Supabase** tabanlı web uygulaması. Danışan paneli, terapist çalışma alanı, yönetim özeti ve Türkçe / İngilizce arayüz desteği içerir.

Repo: [github.com/3rencetin/therapy](https://github.com/3rencetin/therapy)

## Özellikler

- **Kimlik doğrulama**: E-posta ve Google (Supabase Auth)
- **Roller**: Danışan, terapist, moderatör, admin (RLS ile korunmuş veri erişimi)
- **Eşleştirme**: Onboarding akışı ve terapist önerileri
- **Rezervasyon**: Müsaitlik dilimleri, seans oluşturma, not defteri (sayfa bazlı)
- **Operasyon**: Seans yeniden planlama talepleri, terapist özel hazırlık notları
- **i18n**: Varsayılan Türkçe, İngilizce; dil tercihi çerez ile saklanır

## Gereksinimler

- Node.js 20+
- npm veya uyumlu paket yöneticisi
- [Supabase](https://supabase.com) projesi

## Kurulum

```bash
git clone https://github.com/3rencetin/therapy.git
cd therapy
npm install
```

### Ortam değişkenleri

Kök dizinde `.env.local` oluşturun (repoda yok; `.gitignore` ile dışlanır). Şablon için `.env.example` dosyasına bakın:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- İsteğe bağlı: `NEXT_PUBLIC_SUPABASE_REST_URL`, yeni anahtar alanları (`.env.example` içinde açıklanır)
- Sunucu tarafı anahtarlar: `SUPABASE_SERVICE_ROLE_KEY` veya `SUPABASE_SECRET_KEY` (yalnızca güvenilir ortamda)

### Veritabanı

Supabase SQL editöründe veya CLI ile `supabase/migrations` altındaki dosyaları **sırayla** uygulayın. Şema, RLS politikaları ve yardımcı fonksiyonlar bu migrasyonlarda tanımlıdır.

## Geliştirme

```bash
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde açılır.

```bash
npm run build   # üretim derlemesi
npm run lint    # ESLint
```

## Güvenlik

- Gizli anahtarları repoya eklemeyin.
- Üretimde RLS ve migrasyonların güncel olduğundan emin olun.

## Lisans

Özel proje — hakları sahibine aittir.
