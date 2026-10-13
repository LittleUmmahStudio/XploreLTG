// LO:TONG: service worker untuk main tanpa internet.
// Tukar VERSI setiap kali index.html dikemas kini supaya peranti memuat turun versi baharu.
const VERSI = 'lotong-v57';
const TERAS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const LUAR = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@500;700&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSI);
    await c.addAll(TERAS);
    // Fail luar (Three.js & fon) disimpan jika ada internet semasa pemasangan
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
  // Halaman: cuba rangkaian dahulu (dapat versi terkini), jika tiada internet guna salinan simpanan
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        const c = await caches.open(VERSI); c.put('./index.html', r.clone());
        return r;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  // Fail lain: guna simpanan dahulu, kemudian rangkaian (dan simpan untuk kali seterusnya)
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) { const c = await caches.open(VERSI); c.put(req, r.clone()); }
      return r;
    } catch (err) {
      return hit || Response.error();
    }
  })());
});
