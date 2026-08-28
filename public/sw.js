const params = new URL(self.location.href).searchParams;
const build = (params.get("build") || "development").replace(/[^a-zA-Z0-9._-]/g, "-");
const CACHE_PREFIX = "presence-bridge-";
const CACHE = `${CACHE_PREFIX}${build}`;
const SHELL = [
  "/", "/demo", "/privacy", "/terms", "/download", "/app.html", "/404.html",
  "/asset-manifest.json", "/favicon.svg", "/apple-touch-icon.png", "/manifest.webmanifest",
  "/assets/presence-bridge-hero-1536.webp", "/assets/presence-bridge-hero-768.webp",
  "/assets/presence-bridge-og.webp", "/assets/walkthrough-roster.webp",
  "/assets/walkthrough-settings.webp", "/assets/walkthrough-status.webp"
];

async function shellForThisBuild() {
  try {
    const response = await fetch("/asset-manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No production manifest");
    const manifest = await response.json();
    const built = Object.values(manifest).flatMap(entry => [entry.file, ...(entry.css || []), ...(entry.assets || [])]);
    return [...new Set([...SHELL, ...built.map(file => `/${file}`)])];
  } catch {
    return SHELL.filter(path => path !== "/asset-manifest.json");
  }
}

self.addEventListener("install", event => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(await shellForThisBuild());
  await self.skipWaiting();
})()));

self.addEventListener("activate", event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cache.match(event.request)) || (await cache.match("/")) || Response.error();
      }
    }
    const hit = await cache.match(event.request);
    if (hit) return hit;
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch {
      return (await cache.match(event.request.mode === "navigate" ? "/" : event.request)) || Response.error();
    }
  })());
});
