// LO:TONG: service worker untuk main tanpa internet.
// Tukar VERSI setiap kali index.html atau fail lain dikemas kini supaya peranti memuat turun versi baharu.
const VERSI = 'lotong-v73';
const TERAS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
// Bunyi suasana & muzik (folder bunyi/): disimpan untuk main tanpa internet
const BUNYI = ['muzikMula', 'dewan', 'kelas', 'luar', 'muzik-pss', 'perpustakaan', 'rumahGuru', 'suasana-bilikguru', 'suasana-prasekolah', 'suasana-rmt']
  .map((k) => './bunyi/' + k + '.mp3');
const LUAR = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500;700&display=swap'
];
// Hanya fail statik dari hos ini disimpan. Data hidup (Papan Anugerah & pengumuman dari Google Apps Script,
// cuaca Open-Meteo, pelayan Main Bersama) TIDAK disimpan, supaya sentiasa terkini.
const HOS_STATIK = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSI);
    await c.addAll(TERAS);
    // Bunyi & fail luar disimpan jika ada internet; kegagalan tidak menghalang pemasangan
    await Promise.all(BUNYI.map((u) => c.add(u).catch(() => {})));
    await Promise.all(LUAR.map((u) => fetch(u, { mode: 'no-cors' }).then((r) => c.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter((k) => k !== VERSI).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Halaman: cuba rangkaian dahulu (versi terkini); simpan hanya jika jawapan OK, jika tiada internet guna salinan simpanan
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r.ok) { const c = await caches.open(VERSI); c.put('./index.html', r.clone()); return r; }
        return (await caches.match('./index.html')) || r;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Data hidup dari hos lain: biar pelayar terus ke internet (tidak disimpan)
  const statik = url.origin === self.location.origin || HOS_STATIK.includes(url.hostname);
  if (!statik) return;

  // Fail statik: guna simpanan dahulu, kemudian rangkaian (dan simpan untuk kali seterusnya)
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) { const c = await caches.open(VERSI); c.put(req, r.clone()); }
      return r;
    } catch (err) {
      return Response.error();
    }
  })());
});
