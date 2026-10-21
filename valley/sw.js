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
const CACHE = "athar-shell-v6";
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
