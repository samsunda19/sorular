/* === KAĞIT - Uygulama Mantığı === */

// === Veri Kaynağı (ileride Supabase'e değiştirilecek tek nokta) ===
const VeriKaynagi = {
  async tumIcerikGetir() {
    const yanit = await fetch('data/icerik.json');
    if (!yanit.ok) throw new Error('İçerik yüklenemedi');
    return await yanit.json();
  }
};

// === Yardımcılar ===
function urlParametreAl(ad) {
  const params = new URLSearchParams(window.location.search);
  return params.get(ad);
}

function sayfayaGit(sayfa, parametreler = {}) {
  const sorgu = new URLSearchParams(parametreler).toString();
  window.location.href = sorgu ? `${sayfa}?${sorgu}` : sayfa;
}

function htmlKacis(metin) {
  const div = document.createElement('div');
  div.textContent = metin;
  return div.innerHTML;
}

// === Sayfa Yöneticileri ===

async function anaSayfayiYukle() {
  try {
    const veri = await VeriKaynagi.tumIcerikGetir();
    const kapsayici = document.getElementById('kart-kapsayici');

    kapsayici.innerHTML = veri.siniflar.map((sinif, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = sinif.aktif;

      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('sinif.html', { sinif: '${sinif.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <span class="kart-baslik">${htmlKacis(sinif.ad)}</span>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    document.getElementById('kart-kapsayici').innerHTML =
      '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div><p>Sayfayı yenilemeyi deneyin.</p></div>';
  }
}

async function sinifSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const sinif = veri.siniflar.find(s => s.id === sinifId);

    if (!sinif) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML =
      `<em>${htmlKacis(sinif.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = 'Dersler';
    document.title = `${sinif.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!sinif.dersler || sinif.dersler.length === 0) {
      kapsayici.innerHTML = `
        <div class="bos-durum">
          <div class="bos-durum-baslik">Henüz hazır değil</div>
          <p>${htmlKacis(sinif.ad)} içeriği yakında eklenecek.</p>
        </div>
      `;
      return;
    }

    kapsayici.innerHTML = sinif.dersler.map((ders, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = ders.aktif;

      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('ders.html', { sinif: '${sinif.id}', ders: '${ders.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <span class="kart-baslik">${htmlKacis(ders.ad)}</span>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    document.getElementById('kart-kapsayici').innerHTML =
      '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div></div>';
  }
}

async function dersSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const sinif = veri.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);

    if (!sinif || !ders) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML =
      `<em>${htmlKacis(ders.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = sinif.ad + ' / Konular';
    document.getElementById('geri-link').href =
      `sinif.html?sinif=${sinif.id}`;
    document.title = `${ders.ad} — ${sinif.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!ders.konular || ders.konular.length === 0) {
      kapsayici.innerHTML = `
        <div class="bos-durum">
          <div class="bos-durum-baslik">Henüz hazır değil</div>
          <p>${htmlKacis(ders.ad)} konuları yakında eklenecek.</p>
        </div>
      `;
      return;
    }

    kapsayici.innerHTML = ders.konular.map((konu, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = konu.aktif;
      const aciklama = konu.aciklama
        ? `<span class="kart-aciklama">${htmlKacis(konu.aciklama)}</span>`
        : '';

      // YENİ: alt konuları varsa konu.html'e değil alt-konu.html'e git
      const hedefSayfa = konu.altKonular && konu.altKonular.length > 0
        ? 'alt-konu.html'
        : 'konu.html';

      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('${hedefSayfa}', { sinif: '${sinif.id}', ders: '${ders.id}', konu: '${konu.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <div>
            <span class="kart-baslik">${htmlKacis(konu.ad)}</span>
            ${aciklama}
          </div>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    document.getElementById('kart-kapsayici').innerHTML =
      '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div></div>';
  }
}

// YENİ: Alt konu sayfası (Uzunluk Birimleri → Dönüşüm/Problemler gibi)
async function altKonuSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const konuId = urlParametreAl('konu');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const sinif = veri.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);
    const konu = ders?.konular.find(k => k.id === konuId);

    if (!sinif || !ders || !konu) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML =
      `<em>${htmlKacis(konu.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent =
      `${sinif.ad} / ${ders.ad} / Alt Konular`;
    if (konu.aciklama) {
      document.getElementById('sayfa-alt-baslik').textContent = konu.aciklama;
    }
    document.getElementById('geri-link').href =
      `ders.html?sinif=${sinif.id}&ders=${ders.id}`;
    document.title = `${konu.ad} — ${ders.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!konu.altKonular || konu.altKonular.length === 0) {
      kapsayici.innerHTML = `
        <div class="bos-durum">
          <div class="bos-durum-baslik">Henüz hazır değil</div>
          <p>Bu konunun alt konuları yakında eklenecek.</p>
        </div>
      `;
      return;
    }

    kapsayici.innerHTML = konu.altKonular.map((altKonu, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = altKonu.aktif;
      const aciklama = altKonu.aciklama
        ? `<span class="kart-aciklama">${htmlKacis(altKonu.aciklama)}</span>`
        : '';

      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('konu.html', { sinif: '${sinif.id}', ders: '${ders.id}', konu: '${konu.id}', altKonu: '${altKonu.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <div>
            <span class="kart-baslik">${htmlKacis(altKonu.ad)}</span>
            ${aciklama}
          </div>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    document.getElementById('kart-kapsayici').innerHTML =
      '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div></div>';
  }
}

async function konuSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const konuId = urlParametreAl('konu');
    const altKonuId = urlParametreAl('altKonu'); // YENİ: alt konu desteği
    const veri = await VeriKaynagi.tumIcerikGetir();
    const sinif = veri.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);
    const konu = ders?.konular.find(k => k.id === konuId);

    if (!sinif || !ders || !konu) {
      sayfayaGit('index.html');
      return;
    }

    // Eğer alt konu varsa onu kullan, yoksa direkt konunun kendisini kullan
    let goruntulenecek = konu;
    let geriLink = `ders.html?sinif=${sinif.id}&ders=${ders.id}`;
    let etiket = `${sinif.ad} / ${ders.ad}`;

    if (altKonuId) {
      const altKonu = konu.altKonular?.find(ak => ak.id === altKonuId);
      if (!altKonu) {
        sayfayaGit('index.html');
        return;
      }
      goruntulenecek = altKonu;
      geriLink = `alt-konu.html?sinif=${sinif.id}&ders=${ders.id}&konu=${konu.id}`;
      etiket = `${sinif.ad} / ${ders.ad} / ${konu.ad}`;
    }

    document.getElementById('sayfa-baslik').innerHTML =
      `<em>${htmlKacis(goruntulenecek.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = etiket;
    if (goruntulenecek.aciklama) {
      document.getElementById('sayfa-alt-baslik').textContent = goruntulenecek.aciklama;
    }
    document.getElementById('geri-link').href = geriLink;
    document.title = `${goruntulenecek.ad} — ${ders.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!goruntulenecek.kagitlar || goruntulenecek.kagitlar.length === 0) {
      kapsayici.innerHTML = `
        <div class="bos-durum">
          <div class="bos-durum-baslik">Henüz hazır değil</div>
          <p>Bu konunun çalışma kağıtları yakında eklenecek.</p>
        </div>
      `;
      return;
    }

    kapsayici.innerHTML = goruntulenecek.kagitlar.map((kagit, index) => {
      const numara = String(index + 1).padStart(2, '0');

      return `
        <a class="pdf-kart" href="${htmlKacis(kagit.dosya)}" download>
          <div class="pdf-ust">
            <span class="pdf-numara">${numara}</span>
            <span class="pdf-soru-sayi">${kagit.soruSayisi} soru</span>
          </div>
          <span class="pdf-baslik">${htmlKacis(kagit.baslik)}</span>
          <span class="pdf-indir">PDF olarak indir</span>
        </a>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    document.getElementById('kart-kapsayici').innerHTML =
      '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div></div>';
  }
}

// === Service Worker Kayıt (PWA) ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      console.log('Service worker kaydedilemedi:', err);
    });
  });
}
