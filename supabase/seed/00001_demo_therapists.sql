-- İsteğe bağlı: geliştirme verisi (RLS sunucu rolü ile bypass; SQL Editor postgres çalıştırır).
-- Sadece migration sonrası bir kez çalıştırın; üretimde gerçek kayıtlar panelden girilir.

insert into public.therapist_profiles (
  full_name,
  professional_title,
  gender,
  specialization,
  languages,
  availability,
  bio,
  rating,
  years_of_experience,
  verified,
  active
)
values
  (
    'Dr. Selin Aydın',
    'Klinik psikolog',
    'female',
    array['Kaygı', 'Uyku', 'Stres yönetimi']::text[],
    array['Türkçe', 'İngilizce']::text[],
    array['Sabah', 'Öğleden sonra']::text[],
    'Yumuşak, yapılandırıcı ve yavaş tempo ile ilerleyen bir çerçeve sunar.',
    4.9,
    11,
    true,
    true
  ),
  (
    'Uzm. Psk. Emre Kaya',
    'Psikoterapist',
    'male',
    array['İlişkiler', 'Özgüven', 'Ergenlik & yetişkinlik']::text[],
    array['Türkçe']::text[],
    array['Akşam', 'Gece geç']::text[],
    'Dürüst, sıcak ve net sınırlar koyan bir yaklaşım.',
    4.8,
    8,
    true,
    true
  ),
  (
    'Dr. Maya Öztürk',
    'Çift ve aile terapisti',
    'female',
    array['Çift terapisi', 'Yalnızlık', 'Yakınlık']::text[],
    array['Türkçe', 'İngilizce', 'Diğer']::text[],
    array['Öğleden sonra', 'Akşam']::text[],
    'Dengeleyici, duyguya yer açan oturumlar.',
    4.95,
    14,
    true,
    true
  ),
  (
    'Psk. Dan. Arda Demir',
    'Davranışçı yaklaşım',
    'male',
    array['Tükenmişlik', 'Kaygı', 'Performans stresi']::text[],
    array['İngilizce', 'Türkçe']::text[],
    array['Sabah', 'Akşam']::text[],
    'Pratik, kanıta dayalı küçük adımlarla ilerleme.',
    4.85,
    6,
    true,
    true
  ),
  (
    'Dr. Derin Yılmaz',
    'Travma ve duygu düzenleme',
    'female',
    array['Travma sonrası', 'Duygu yoğunluğu', 'Uyku']::text[],
    array['Türkçe']::text[],
    array['Gece geç', 'Öğleden sonra']::text[],
    'Temkinli, beden ve nefes odaklı çalışma.',
    4.9,
    10,
    true,
    true
  );
