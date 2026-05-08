// Kağıt - Service Worker
// Basit önbellekleme: ilk ziyarette kaynakları sakla, sonraki ziyaretlerde hızlı yükle

const CACHE_ADI = 'kagit-v7';
const ON_BELLEK_DOSYALARI = [
  './',
  './index.html',
  './sinif.html',
  './ders.html',
  './alt-konu.html',
  './konu.html',
  './dokuman-kategoriler.html',
  './dokuman-sinif.html',
  './dokuman-ders.html',
  './dokuman-sablon.html',
  './css/stil.css',
  './js/uygulama.js',
  './data/icerik.json',
  './manifest.json'
];

self.addEventListener('install', (etkinlik) => {
  etkinlik.waitUntil(
    caches.open(CACHE_ADI).then((cache) => cache.addAll(ON_BELLEK_DOSYALARI))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (etkinlik) => {
  etkinlik.waitUntil(
    caches.keys().then((adlar) =>
      Promise.all(
        adlar.filter((ad) => ad !== CACHE_ADI).map((ad) => caches.delete(ad))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (etkinlik) => {
  const url = new URL(etkinlik.request.url);

  // PDF dosyalarını önbellekleme — her zaman ağdan getir
  if (url.pathname.includes('/pdfs/')) return;

  // JSON dosyası — önce ağdan, başarısızsa önbellekten (içerik güncel kalsın)
  if (url.pathname.endsWith('.json')) {
    etkinlik.respondWith(
      fetch(etkinlik.request)
        .then((yanit) => {
          const kopya = yanit.clone();
          caches.open(CACHE_ADI).then((cache) => cache.put(etkinlik.request, kopya));
          return yanit;
        })
        .catch(() => caches.match(etkinlik.request))
    );
    return;
  }

  // Diğerleri — önce önbellekten, yoksa ağdan
  etkinlik.respondWith(
    caches.match(etkinlik.request).then((onBellek) =>
      onBellek || fetch(etkinlik.request)
    )
  );
});
