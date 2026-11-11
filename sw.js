/* زبان دوم — کار آفلاین و سرعت: پوستهٔ برنامه از حافظه باز می‌شود */
const V = 'zd-v2';
const SHELL = ['./', 'index.html', 'styles.css', 'data.js', 'app.js', 'library.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== 'zd-media').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) { // پوسته: اول حافظه، بعد به‌روزرسانی در پس‌زمینه
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => { const net = fetch(e.request).then(r => { if (r.ok) caches.open(V).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit); return hit || net; }));
  } else if (/fonts\.(googleapis|gstatic)\.com|image\.pollinations\.ai|api\.openverse\.org\/v1\/images\/.+\/thumb/.test(u.href)) { // فونت و تصاویر: یک بار دانلود، همیشه از حافظه
    e.respondWith(caches.open('zd-media').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; }))));
  }
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs[0] ? cs[0].focus() : self.clients.openWindow('./#home'))); });
