# Kağıt — İlkokul Çalışma Kağıtları

İlkokul öğretmenleri için sınıf, ders ve konuya göre düzenlenmiş çalışma kağıdı arşivi. Reklamsız, üyeliksiz, üç tıkla PDF.

## Bu klasörde ne var?

```
kagit/
├── index.html              # Ana sayfa (sınıf seçimi)
├── sinif.html              # Sınıf sayfası (ders seçimi)
├── ders.html               # Ders sayfası (konu seçimi)
├── konu.html               # Konu sayfası (PDF kartları)
│
├── css/stil.css            # Tüm stil dosyası (siyah-beyaz, sade)
├── js/uygulama.js          # Site mantığı (JSON'dan veri okuma)
├── data/icerik.json        # ⭐ TÜM İÇERİK BURADA — sınıflar, dersler, konular, PDF listesi
│
├── pdfs/                   # PDF dosyaları
│   └── 4-sinif/
│       └── matematik/
│           └── uzunluk-problemleri/
│               ├── uzunluk-1.pdf
│               └── uzunluk-2.pdf
│
├── icons/                  # PWA ikonları
├── manifest.json           # PWA tanımı (telefonun "uygulama" olarak görmesi için)
└── service-worker.js       # PWA önbellek mantığı
```

## Yerel olarak çalıştırma (test için)

Site sade HTML/CSS/JS olduğu için karmaşık bir kurulum yok. Ama `fetch` ile JSON okuyor, o yüzden dosyayı çift tıklayıp açmak çalışmaz. Yerel sunucu lazım. İki yol:

### Yol 1 — VS Code "Live Server" eklentisi (en kolay)
1. VS Code'u aç
2. Sol kenarda Extensions (uzantılar) → "Live Server" ara → kur
3. `index.html` dosyasına sağ tıkla → "Open with Live Server"
4. Tarayıcı açılır, çalışır

### Yol 2 — Python ile (terminal)
```bash
cd kagit
python -m http.server 8000
```
Sonra tarayıcıdan: `http://localhost:8000`

## GitHub'a yükleme ve yayına alma

### 1. GitHub'da repo aç
- github.com → New repository → İsim ver (mesela `kagit`) → Public → Create

### 2. Dosyaları yükle
İki yol:

**Tarayıcıdan (en basit):** Repo sayfasında "uploading an existing file" linkine tıkla → tüm dosyaları sürükle bırak → Commit changes.

**Git ile (VS Code'dan):** Klasörü VS Code'da aç → Source Control sekmesi → "Initialize Repository" → ardından "Publish to GitHub".

### 3. Netlify'e bağla (ücretsiz, otomatik yayın)
- netlify.com → Sign up (GitHub ile gir)
- "Add new site" → "Import an existing project" → GitHub'ı seç → repon → Deploy
- 1-2 dakika sonra `https://birsey.netlify.app` adresinde canlıda
- İstersen kendi domain'ini bağlarsın (mesela `kagit.com`)

### 4. Her güncelleme otomatik yayında
GitHub'a yeni commit attığında Netlify otomatik yayına alır. Yani: VS Code'da değiştir → Commit → Push → 30 saniye sonra canlıda.

## Yeni içerik (PDF) nasıl eklenir?

Her şey tek bir dosyada toplanır: **`data/icerik.json`**

### Örnek: Yeni bir çalışma kağıdı eklemek

`data/icerik.json` dosyasını aç. Uzunluk problemleri kısmını bul:

```json
"kagitlar": [
  {
    "id": "uzunluk-1",
    "baslik": "Uzunluk Problemleri - 1",
    "soruSayisi": 10,
    "dosya": "pdfs/4-sinif/matematik/uzunluk-problemleri/uzunluk-1.pdf"
  },
  {
    "id": "uzunluk-2",
    ...
  }
]
```

PDF dosyasını ilgili klasöre koy (örn. `pdfs/4-sinif/matematik/uzunluk-problemleri/uzunluk-3.pdf`), sonra JSON'a ekle:

```json
{
  "id": "uzunluk-3",
  "baslik": "Uzunluk Problemleri - 3",
  "soruSayisi": 10,
  "dosya": "pdfs/4-sinif/matematik/uzunluk-problemleri/uzunluk-3.pdf"
}
```

Kaydet → Commit → Push. Site otomatik güncellenir.

### Yeni konu eklemek
Aynı dosyada `"konular": [...]` dizisine yeni bir konu nesnesi ekle. `aktif: true` yap.

### Yeni ders / sınıf eklemek
Aynı mantık. `"dersler": [...]` veya `"siniflar": [...]` içine ekle. `aktif: false` koyarsan "Yakında" etiketiyle pasif görünür.

## Sonraki aşamalar

- [x] Site iskeleti, gezinme, PDF indirme akışı
- [x] PWA temelleri (mobile install, offline çalışma)
- [x] Siyah-beyaz, premium hisli sade tasarım
- [x] 4. sınıf matematik uzunluk problemleri için 2 örnek PDF
- [ ] Şablon onayı (sen kontrol et, gerekirse düzenle)
- [ ] 4. sınıf için tüm matematik konularına 5'er PDF
- [ ] Diğer dersler (Türkçe, Fen, Sosyal)
- [ ] 1, 2, 3. sınıflar
- [ ] (İleride) Admin panel — Supabase entegrasyonu
- [ ] (İleride) Play Store'a uygulama olarak yükleme

## Lisans

Tüm içerik özgün olarak hazırlanmıştır. Eğitim amaçlı kullanıma açıktır.
