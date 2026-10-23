/* ═══════════════════════════════════════════════════════════════
   أثر — الوادي · Service Worker (v3)
   نمط الوادي: صدفة صغيرة تُخزَّن، والتحديث بإذن الوالد.

   - CACHE = athar-shell-v5: غيّر الرقم عند كل تعديل في الصدفة.
   - لا skipWaiting تلقائي: النسخة الجديدة تنتظر حتى تصلها رسالة
     {type:"SKIP_WAITING"} من شريط التحديث (يضغطه الوالد).
   - لا يعترض أي طلب خارج الأصل (خطوط، Gemini، everyayah…): تمرّ كما هي.
   - audio/index.json يُخزَّن بحذر (فشله لا يُفشل التثبيت)، وحزم sp_*.bin
     لا يعترضها العامل: تخزّنها الصفحة في athar-packs-v1.
   ═══════════════════════════════════════════════════════════════ */
const CACHE = "athar-shell-v9";
const KIDC = "athar-kid-v1";   /* أصوات أثر الجديدة: تُخزَّن عند أول طلب (الدرس) لا دفعة واحدة، ولا تُحذف عند تحديث الصدفة */
const SHELL = ["./", "./index.html"];
const OPTIONAL = ["./audio/index.json", "./sequence.json"];   /* قد لا توجد: لا تُفشل التثبيت */

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    await Promise.all(OPTIONAL.map(async u => {
      try { const r = await fetch(u, { cache: "no-cache" }); if (r && r.ok) await c.put(u, r); } catch {}
    }));
    /* عمدًا: لا self.skipWaiting() */
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("athar-shell-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                 /* لا اعتراض خارج الأصل */
  if (/\/audio\/athar_kid\/[^/]+\.mp3$/.test(url.pathname)) { e.respondWith(kidAudio(req, url)); return; }
  if (req.headers.has("range")) return;                            /* الصوت/الحزم تُخدَم مباشرة */
  if (/\/audio\/sp_[^/]+\.bin$/.test(url.pathname)) return;

  const isShell = req.mode === "navigate" || /\/(index\.html|sequence\.json|audio\/index\.json)$/.test(url.pathname)
                  || url.pathname.endsWith("/");
  if (!isShell) return;

  /* شبكة أولًا (ليرى الوالد التحديث)، ثم الذاكرة عند الانقطاع */
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const net = await fetch(req);
      if (net && net.ok) { try { await c.put(req, net.clone()); } catch {} }
      return net;
    } catch {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") { const home = await c.match("./index.html") || await c.match("./"); if (home) return home; }
      return new Response("", { status: 504, statusText: "offline" });
    }
  })());
});

/* ملفات أصوات أثر: أول طلب كامل يُخزَّن، وطلبات Range (المشغّل) تُخدَم منه بـ 206 */
async function kidAudio(req, url) {
  try {
    const c = await caches.open(KIDC);
    let r = await c.match(url.pathname);
    if (!r) {
      const net = await fetch(url.href, { cache: "no-cache" });           /* بلا Range: ملف كامل */
      if (!net || !net.ok) return fetch(req);
      try { await c.put(url.pathname, net.clone()); } catch {}
      r = net;
    }
    const range = req.headers.get("range");
    if (!range) return r;
    const buf = await r.arrayBuffer();
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : buf.byteLength - 1;
    if (end >= buf.byteLength) end = buf.byteLength - 1;
    if (start > end) return new Response("", { status: 416, headers: { "Content-Range": "bytes */" + buf.byteLength } });
    return new Response(buf.slice(start, end + 1), { status: 206, headers: { "Content-Type": "audio/mpeg", "Content-Range": "bytes " + start + "-" + end + "/" + buf.byteLength, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  } catch { return fetch(req); }
}
