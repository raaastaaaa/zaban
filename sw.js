/* زبان رستا — کار آفلاین و سرعت: پوستهٔ برنامه از حافظه باز می‌شود */
const V = 'zd-v51';
const SHELL = ['./', 'index.html', 'styles.css', 'wsmeta.js', 'data.js', 'app.js', 'library.js', 'dict.js', 'extras.js', 'learn.js', 'leitner.js', 'news.js', 'lessons.js', 'book.js', 'live.js', 'supabase.js', 'online.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'vazir-400.woff2', 'vazir-700.woff2', 'vazir-800.woff2', 'vazir-latin-400.woff2', 'vazir-latin-700.woff2', 'vazir-latin-800.woff2', 'lexend-400.woff2', 'lexend-600.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'zd-media').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin && (e.request.mode === 'navigate' || /\.(js|css|html|webmanifest)$/.test(u.pathname))) { // کد برنامه: اول شبکه (نسخهٔ تازه)، بی‌اینترنت از حافظه
    // سرعت: فوراً از حافظه باز می‌شود و نسخهٔ تازه بی‌صدا در پس‌زمینه گرفته می‌شود (بدون معطلی روی اینترنت کند)
    const net = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; });
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => { if (hit) { e.waitUntil(net.catch(() => 0)); return hit; } return net.catch(() => caches.match('index.html')); }));
  } else if (u.origin === location.origin && /\/audio\/(en|fa|teach)\//.test(u.pathname)) { // بستهٔ صدای انگلیسی: یک بار دانلود، همیشه آفلاین
    e.respondWith(caches.open('zd-media').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
  } else if (u.origin === location.origin) { // فونت و آیکن: اول حافظه
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => { const net = fetch(e.request).then(r => { if (r.ok) caches.open(V).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit); return hit || net; }));
  } else if (/fonts\.(googleapis|gstatic)\.com|image\.pollinations\.ai|api\.openverse\.org\/v1\/images\/.+\/thumb/.test(u.href)) { // فونت و تصاویر: یک بار دانلود، همیشه از حافظه
    e.respondWith(caches.open('zd-media').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { c.put(e.request, r.clone()); c.keys().then(ks => { if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(k => c.delete(k)); }); } return r; }))));
  }
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs[0] ? cs[0].focus() : self.clients.openWindow('./#home'))); });
