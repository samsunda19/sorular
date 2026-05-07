/* === KAĞIT - Uygulama Mantığı === */

const VeriKaynagi = {
  async tumIcerikGetir() {
    const yanit = await fetch('data/icerik.json');
    if (!yanit.ok) throw new Error('İçerik yüklenemedi');
    return await yanit.json();
  }
};

function urlParametreAl(ad) {
  const params = new URLSearchParams(window.location.search);
  return params.get(ad);
}

function sayfayaGit(sayfa, parametreler = {}) {
  const sorgu = new URLSearchParams(parametreler).toString();
  window.location.href = sorgu ? `${sayfa}?${sorgu}` : sayfa;
}

function htmlKacis(metin) {
  if (!metin) return '';
  const div = document.createElement('div');
  div.textContent = metin;
  return div.innerHTML;
}

function hataGoster() {
  const k = document.getElementById('kart-kapsayici');
  if (k) k.innerHTML = '<div class="bos-durum"><div class="bos-durum-baslik">Bir şeyler ters gitti</div></div>';
}

function bosDurumGoster(baslik, metin) {
  const k = document.getElementById('kart-kapsayici');
  if (k) k.innerHTML = `
    <div class="bos-durum">
      <div class="bos-durum-baslik">${htmlKacis(baslik)}</div>
      <p>${htmlKacis(metin)}</p>
    </div>
  `;
}

// === ANA SAYFA: Çalışma Kağıtları + Dökümanlar bölümleri ===
async function anaSayfayiYukle() {
  try {
    const veri = await VeriKaynagi.tumIcerikGetir();
    const kapsayici = document.getElementById('kart-kapsayici');

    kapsayici.innerHTML = veri.bolumler.map((bolum, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = bolum.aktif;
      const aciklama = bolum.aciklama
        ? `<span class="kart-aciklama">${htmlKacis(bolum.aciklama)}</span>`
        : '';

      // Hangi sayfaya yönlendirelim?
      let hedefSayfa = '';
      if (bolum.id === 'calisma-kagitlari') {
        hedefSayfa = 'sinif.html';  // direkt sınıf seçimine
      } else if (bolum.id === 'dokumanlar') {
        hedefSayfa = 'dokuman-kategoriler.html';  // önce kategori seçimine
      }

      return `
        <button
          class="kart kart-buyuk ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('${hedefSayfa}', { bolum: '${bolum.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <div>
            <span class="kart-baslik">${htmlKacis(bolum.ad)}</span>
            ${aciklama}
          </div>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    hataGoster();
  }
}

// === SINIF SEÇİMİ (Çalışma Kağıtları için) ===
async function sinifSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');

    // Eğer sınıf parametresi varsa: dersleri göster
    // Yoksa: tüm sınıfları göster
    const veri = await VeriKaynagi.tumIcerikGetir();
    const calismaBolumu = veri.bolumler.find(b => b.id === 'calisma-kagitlari');

    if (!calismaBolumu) {
      sayfayaGit('index.html');
      return;
    }

    if (!sinifId) {
      // Tüm sınıfları listele
      document.getElementById('sayfa-baslik').innerHTML = `<em>Çalışma Kağıtları</em>`;
      document.getElementById('sayfa-etiket').textContent = 'Sınıflar';
      document.getElementById('geri-link').href = 'index.html';
      document.title = 'Çalışma Kağıtları — Kağıt';

      const kapsayici = document.getElementById('kart-kapsayici');
      kapsayici.innerHTML = calismaBolumu.siniflar.map((sinif, index) => {
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
      return;
    }

    // Belli bir sınıfın derslerini göster
    const sinif = calismaBolumu.siniflar.find(s => s.id === sinifId);
    if (!sinif) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(sinif.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = 'Çalışma Kağıtları / Dersler';
    document.getElementById('geri-link').href = 'sinif.html';
    document.title = `${sinif.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!sinif.dersler || sinif.dersler.length === 0) {
      bosDurumGoster('Henüz hazır değil', `${sinif.ad} içeriği yakında eklenecek.`);
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
    hataGoster();
  }
}

// === DERS SAYFASI (konuları gösterir) ===
async function dersSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const calismaBolumu = veri.bolumler.find(b => b.id === 'calisma-kagitlari');
    const sinif = calismaBolumu?.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);

    if (!sinif || !ders) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(ders.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = `${sinif.ad} / Konular`;
    document.getElementById('geri-link').href = `sinif.html?sinif=${sinif.id}`;
    document.title = `${ders.ad} — ${sinif.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!ders.konular || ders.konular.length === 0) {
      bosDurumGoster('Henüz hazır değil', `${ders.ad} konuları yakında eklenecek.`);
      return;
    }

    kapsayici.innerHTML = ders.konular.map((konu, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = konu.aktif;
      const aciklama = konu.aciklama ? `<span class="kart-aciklama">${htmlKacis(konu.aciklama)}</span>` : '';
      const hedefSayfa = konu.altKonular && konu.altKonular.length > 0 ? 'alt-konu.html' : 'konu.html';

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
    hataGoster();
  }
}

// === ALT KONU SAYFASI ===
async function altKonuSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const konuId = urlParametreAl('konu');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const calismaBolumu = veri.bolumler.find(b => b.id === 'calisma-kagitlari');
    const sinif = calismaBolumu?.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);
    const konu = ders?.konular.find(k => k.id === konuId);

    if (!sinif || !ders || !konu) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(konu.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = `${sinif.ad} / ${ders.ad} / Alt Konular`;
    if (konu.aciklama) document.getElementById('sayfa-alt-baslik').textContent = konu.aciklama;
    document.getElementById('geri-link').href = `ders.html?sinif=${sinif.id}&ders=${ders.id}`;
    document.title = `${konu.ad} — ${ders.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!konu.altKonular || konu.altKonular.length === 0) {
      bosDurumGoster('Henüz hazır değil', 'Bu konunun alt konuları yakında eklenecek.');
      return;
    }

    kapsayici.innerHTML = konu.altKonular.map((altKonu, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = altKonu.aktif;
      const aciklama = altKonu.aciklama ? `<span class="kart-aciklama">${htmlKacis(altKonu.aciklama)}</span>` : '';

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
    hataGoster();
  }
}

// === KONU SAYFASI (PDF kartları) ===
async function konuSayfasiniYukle() {
  try {
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const konuId = urlParametreAl('konu');
    const altKonuId = urlParametreAl('altKonu');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const calismaBolumu = veri.bolumler.find(b => b.id === 'calisma-kagitlari');
    const sinif = calismaBolumu?.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);
    const konu = ders?.konular.find(k => k.id === konuId);

    if (!sinif || !ders || !konu) {
      sayfayaGit('index.html');
      return;
    }

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

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(goruntulenecek.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = etiket;
    if (goruntulenecek.aciklama) document.getElementById('sayfa-alt-baslik').textContent = goruntulenecek.aciklama;
    document.getElementById('geri-link').href = geriLink;
    document.title = `${goruntulenecek.ad} — ${ders.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!goruntulenecek.kagitlar || goruntulenecek.kagitlar.length === 0) {
      bosDurumGoster('Henüz hazır değil', 'Bu konunun çalışma kağıtları yakında eklenecek.');
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
    hataGoster();
  }
}

// === DÖKÜMAN KATEGORİLERİ ===
async function dokumanKategoriSayfasiniYukle() {
  try {
    const veri = await VeriKaynagi.tumIcerikGetir();
    const dokumanBolumu = veri.bolumler.find(b => b.id === 'dokumanlar');

    if (!dokumanBolumu) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>Dökümanlar</em>`;
    document.getElementById('sayfa-etiket').textContent = 'Kategoriler';
    document.title = 'Dökümanlar — Kağıt';

    const kapsayici = document.getElementById('kart-kapsayici');

    kapsayici.innerHTML = dokumanBolumu.kategoriler.map((kategori, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = kategori.aktif;
      const aciklama = kategori.aciklama ? `<span class="kart-aciklama">${htmlKacis(kategori.aciklama)}</span>` : '';

      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('dokuman-sinif.html', { kategori: '${kategori.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <div>
            <span class="kart-baslik">${htmlKacis(kategori.ad)}</span>
            ${aciklama}
          </div>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    hataGoster();
  }
}

// === DÖKÜMAN SINIF SEÇİMİ ===
async function dokumanSinifSayfasiniYukle() {
  try {
    const kategoriId = urlParametreAl('kategori');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const dokumanBolumu = veri.bolumler.find(b => b.id === 'dokumanlar');
    const kategori = dokumanBolumu?.kategoriler.find(k => k.id === kategoriId);

    if (!kategori) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(kategori.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = 'Dökümanlar / Sınıflar';
    document.getElementById('geri-link').href = 'dokuman-kategoriler.html';
    document.title = `${kategori.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!kategori.siniflar || kategori.siniflar.length === 0) {
      bosDurumGoster('Henüz hazır değil', `${kategori.ad} yakında eklenecek.`);
      return;
    }

    kapsayici.innerHTML = kategori.siniflar.map((sinif, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = sinif.aktif;
      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('dokuman-ders.html', { kategori: '${kategori.id}', sinif: '${sinif.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <span class="kart-baslik">${htmlKacis(sinif.ad)}</span>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    hataGoster();
  }
}

// === DÖKÜMAN DERS SEÇİMİ ===
async function dokumanDersSayfasiniYukle() {
  try {
    const kategoriId = urlParametreAl('kategori');
    const sinifId = urlParametreAl('sinif');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const dokumanBolumu = veri.bolumler.find(b => b.id === 'dokumanlar');
    const kategori = dokumanBolumu?.kategoriler.find(k => k.id === kategoriId);
    const sinif = kategori?.siniflar.find(s => s.id === sinifId);

    if (!kategori || !sinif) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(sinif.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = `${kategori.ad} / Dersler`;
    document.getElementById('geri-link').href = `dokuman-sinif.html?kategori=${kategori.id}`;
    document.title = `${sinif.ad} — ${kategori.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!sinif.dersler || sinif.dersler.length === 0) {
      bosDurumGoster('Henüz hazır değil', `${sinif.ad} dersleri yakında eklenecek.`);
      return;
    }

    kapsayici.innerHTML = sinif.dersler.map((ders, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const aktifMi = ders.aktif;
      return `
        <button
          class="kart ${aktifMi ? '' : 'kart-pasif'}"
          ${aktifMi ? `onclick="sayfayaGit('dokuman-sablon.html', { kategori: '${kategori.id}', sinif: '${sinif.id}', ders: '${ders.id}' })"` : 'disabled'}
        >
          <span class="kart-numara">${numara}</span>
          <span class="kart-baslik">${htmlKacis(ders.ad)}</span>
        </button>
      `;
    }).join('');

  } catch (hata) {
    console.error(hata);
    hataGoster();
  }
}

// === DÖKÜMAN ŞABLON LİSTESİ ===
async function dokumanSablonSayfasiniYukle() {
  try {
    const kategoriId = urlParametreAl('kategori');
    const sinifId = urlParametreAl('sinif');
    const dersId = urlParametreAl('ders');
    const veri = await VeriKaynagi.tumIcerikGetir();
    const dokumanBolumu = veri.bolumler.find(b => b.id === 'dokumanlar');
    const kategori = dokumanBolumu?.kategoriler.find(k => k.id === kategoriId);
    const sinif = kategori?.siniflar.find(s => s.id === sinifId);
    const ders = sinif?.dersler.find(d => d.id === dersId);

    if (!kategori || !sinif || !ders) {
      sayfayaGit('index.html');
      return;
    }

    document.getElementById('sayfa-baslik').innerHTML = `<em>${htmlKacis(ders.ad)}</em>`;
    document.getElementById('sayfa-etiket').textContent = `${sinif.ad} / ${kategori.ad}`;
    document.getElementById('geri-link').href = `dokuman-ders.html?kategori=${kategori.id}&sinif=${sinif.id}`;
    document.title = `${ders.ad} — ${kategori.ad} — Kağıt`;

    const kapsayici = document.getElementById('kart-kapsayici');

    if (!ders.sablonlar || ders.sablonlar.length === 0) {
      bosDurumGoster('Henüz hazır değil', 'Bu derse ait şablonlar yakında eklenecek.');
      return;
    }

    kapsayici.innerHTML = ders.sablonlar.map((sablon, index) => {
      const numara = String(index + 1).padStart(2, '0');
      const formatEtiket = sablon.format ? sablon.format.toUpperCase() : 'DOSYA';
      const aciklama = sablon.aciklama ? `<span class="pdf-baslik" style="font-size: 0.9rem; color: var(--gri-500); font-weight: 400;">${htmlKacis(sablon.aciklama)}</span>` : '';

      return `
        <a class="pdf-kart" href="${htmlKacis(sablon.dosya)}" download>
          <div class="pdf-ust">
            <span class="pdf-numara">${numara}</span>
            <span class="pdf-soru-sayi">${formatEtiket}</span>
          </div>
          <span class="pdf-baslik">${htmlKacis(sablon.baslik)}</span>
          ${aciklama}
          <span class="pdf-indir">${formatEtiket} olarak indir</span>
        </a>
      `;
    }).join('');

    // Eğer "Değerlendirme Ölçekleri" kategorisinde isek rehberi göster
    if (kategori.id === 'degerlendirme-olcekleri') {
      const rehber = document.getElementById('rehber-bolum');
      if (rehber) rehber.style.display = 'block';
    }

  } catch (hata) {
    console.error(hata);
    hataGoster();
  }
}

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
      console.log('Service worker kaydedilemedi:', err);
    });
  });
}
