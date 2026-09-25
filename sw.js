/* أثر — يعمل بلا إنترنت بعد أوّل فتح */
const C = "athar-v1";
const FILES = ["athar.html", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k =>
    Promise.all(k.filter(x => x !== C && x.indexOf("athar-audio") !== 0).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  /* الصوت والتلاوات: من الشبكة ثم يُخزَّن */
  if (u.hostname !== location.hostname) {
    e.respondWith(caches.open("athar-ext").then(c =>
      c.match(e.request).then(hit => hit ||
        fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(() => hit))));
    return;
  }
  /* ملفات التطبيق: من المخزن أوّلًا */
  e.respondWith(caches.match(e.request).then(hit => hit ||
    fetch(e.request).then(r => {
      if (r.ok) caches.open(C).then(c => c.put(e.request, r.clone()));
      return r;
    }).catch(() => caches.match("athar.html"))));
});