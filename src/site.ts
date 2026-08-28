import "./styles.css";
import { mountPresenceApp } from "./app-core";
import { captureLicense, checkoutUrl } from "./license";

type Route = { title: string; render: () => string; after?: () => void };
let cleanupApp: (() => void) | undefined;

const header = `<header class="site-header"><a class="wordmark" href="/" data-route><span class="bridge-mark" aria-hidden="true"><i></i><i></i></span><span>Presence Bridge</span></a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="/download" data-route>Download</a><a href="/privacy" data-route>Privacy</a></nav></header>`;
const footer = `<footer class="site-footer"><p><strong>Presence Bridge</strong><br><span>See who is free, then open your existing tool.</span></p><nav aria-label="Footer navigation"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory</a></nav><p>v0.1.1 · Original generated artwork</p></footer>`;

const home = (): string => `<div class="site-page home-page">${header}<main id="main">
  <section class="hero">
    <picture class="hero-art"><source media="(max-width: 720px)" srcset="/assets/presence-bridge-hero-768.webp"><img src="/assets/presence-bridge-hero-1536.webp" width="1536" height="1024" alt="A small studio with five warm windows beside a bridge at blue hour." fetchpriority="high" decoding="async"></picture>
    <div class="hero-shade"></div><div class="hero-copy"><p class="eyebrow">A local desktop roster</p><h1>See who is free before you message</h1><p class="lede">For small teams that need availability without moving every conversation into another chat suite.</p><div class="hero-action"><a class="primary-link" href="/demo" data-route>Try it with sample data</a><span>See a five-person roster in one click.</span></div><ul class="plain-facts"><li>Your roster stays on this device.</li><li>Works after the first visit, even offline.</li><li>Free for up to five people.</li></ul></div>
    <div class="light-trail" aria-hidden="true"></div>
  </section>
  <section class="product-stage" aria-labelledby="preview-title"><div class="section-intro"><p class="eyebrow">The product</p><h2 id="preview-title">One glance, then one handoff</h2><p>Check a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link.</p></div><div id="home-preview" class="app-frame"></div></section>
  <section class="walkway" aria-labelledby="how-title"><div class="section-intro"><p class="eyebrow">How it works</p><h2 id="how-title">Keep the routine small</h2></div><ol class="steps"><li><span>01</span><div><img src="/assets/walkthrough-settings.webp" width="720" height="484" loading="lazy" alt="Presence settings with manual status and local calendar import."><h3>Set your light</h3><p>Choose available, busy, away, or offline. Add a short note.</p></div></li><li><span>02</span><div><img src="/assets/walkthrough-status.webp" width="720" height="494" loading="lazy" alt="The sample roster showing Leo as busy from his calendar."><h3>Check the roster</h3><p>See each teammate's status before you interrupt their work.</p></div></li><li><span>03</span><div><img src="/assets/walkthrough-roster.webp" width="720" height="494" loading="lazy" alt="A selected teammate with Slack and email handoff buttons."><h3>Open the right tool</h3><p>Start the conversation in the app your team already chose.</p></div></li></ol></section>
  <section class="boundary" aria-labelledby="boundary-title"><div class="boundary-art" aria-hidden="true"><span></span><span></span><span></span></div><div><p class="eyebrow">A quiet boundary</p><h2 id="boundary-title">This is not another inbox</h2><p>Presence Bridge does not carry messages, scrape contacts, watch keystrokes, or infer activity. You choose every status. Calendar import reads a local .ics file only when you select it.</p></div></section>
  <section class="price-strip" aria-labelledby="price-title"><div><p class="eyebrow">Bridge Plus · $24 once</p><h2 id="price-title">More room, same quiet roster</h2><p>Add up to ten people and more contact routes. The free local roster holds five.</p></div><div><a class="primary-link" href="${checkoutUrl}">Buy Bridge Plus</a><p>Sociobot handles payment and licenses.</p></div></section>
</main>${footer}</div>`;

const demo = (): string => `<div class="site-page">${header}<main id="main" class="demo-page"><div class="page-heading"><p class="eyebrow">Sample workspace</p><h1>Try a complete team roster</h1><p>Choose a person, change your status, or test a contact handoff. Demo changes never touch your real roster.</p></div><div id="demo-app" class="app-frame full"></div></main>${footer}</div>`;

const privacy = (): string => legalPage("Privacy — Presence Bridge", "Your roster belongs to you", `<p>Presence Bridge stores your roster, status, imported calendar events, settings, and license token on your device. Demo data uses a separate session storage key.</p><h2>What leaves your device</h2><p>No roster or calendar content is sent to us. Contact buttons open the link you saved in its matching app. License verification sends only your license token to the Sociobot billing API.</p><h2>What we do not collect</h2><p>We do not use analytics, advertising trackers, contact scraping, keystroke monitoring, or background activity inference.</p><h2>Delete your data</h2><p>Remove people inside the app. Clearing this site's storage removes the local roster and license. Uninstalling the desktop app removes its local web data.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p>`);

const terms = (): string => legalPage("Terms — Presence Bridge", "Use Presence Bridge with clear consent", `<p>Presence Bridge is a local availability board and contact launcher. It does not deliver messages or guarantee that another person is reachable.</p><h2>Your responsibilities</h2><p>Add people and contact links only with permission. Do not use the app for surveillance, hidden monitoring, harassment, or emergency response.</p><h2>Bridge Plus</h2><p>Bridge Plus costs $24 as a one-time purchase. It raises the local roster limit to ten and enables more contact routes. Sociobot is the merchant of record. Refunds and license revocation are handled through its checkout service.</p><h2>Availability and warranty</h2><p>The software is provided under the MIT License without warranty. Keep a downloaded backup if the roster matters to your work.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for help.</p>`);

function legalPage(title: string, headline: string, body: string): string {
  return `<div class="site-page">${header}<main id="main" class="legal"><p class="eyebrow">${title.split(" — ")[0]}</p><h1>${headline}</h1><p class="legal-date">Effective 28 August 2026</p>${body}</main>${footer}</div>`;
}

const download = (): string => `<div class="site-page">${header}<main id="main" class="download-page"><div class="page-heading"><p class="eyebrow">Desktop app</p><h1>Install your local presence roster</h1><p>Choose your platform. Release files are unsigned until the project owner adds signing certificates.</p></div><section class="download-console" aria-labelledby="download-title"><div><span class="window-mark" aria-hidden="true"></span><h2 id="download-title">Download Presence Bridge</h2><p id="platform-copy">Checking the latest release…</p></div><div id="download-actions" aria-live="polite"><span class="loading-line">Reading release details</span></div></section><section class="install-notes"><h2>Before you install</h2><p>macOS and Windows may show an unsigned app warning. Use the system's “Open anyway” path only after checking the release checksum.</p><p>Linux releases include AppImage and Debian packages. Every release includes SHA256SUMS.</p><a href="https://github.com/B-Divyesh/sf-presence-bridge/releases" rel="external">View all releases on GitHub</a></section></main>${footer}</div>`;

const notFound = (): string => `<div class="site-page not-found">${header}<main id="main"><div class="lost-window" aria-hidden="true"><span></span></div><p class="eyebrow">404 · Unlit window</p><h1>This path does not reach the roster</h1><p>The page may have moved, but the bridge home is still lit.</p><a class="primary-link" href="/" data-route>Return home</a></main>${footer}</div>`;

const routes: Record<string, Route> = {
  "/": { title: "Presence Bridge — See who is free before you message", render: home, after: () => { const node = document.querySelector<HTMLElement>("#home-preview"); if (node) cleanupApp = mountPresenceApp(node, { demo: true, embedded: true }); } },
  "/demo": { title: "Demo — Presence Bridge", render: demo, after: () => { const node = document.querySelector<HTMLElement>("#demo-app"); if (node) cleanupApp = mountPresenceApp(node, { demo: true, embedded: true }); } },
  "/privacy": { title: "Privacy — Presence Bridge", render: privacy },
  "/terms": { title: "Terms — Presence Bridge", render: terms },
  "/download": { title: "Download — Presence Bridge", render: download, after: loadRelease }
};

function navigate(path: string, push = true): void {
  cleanupApp?.(); cleanupApp = undefined;
  const route = routes[path] || { title: "Page not found — Presence Bridge", render: notFound };
  if (push) history.pushState({}, "", path);
  document.title = route.title;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `https://presence-bridge.sociobot.in${path}`);
  const root = document.querySelector<HTMLElement>("#site");
  if (!root) return;
  root.innerHTML = `${route.render()}<div class="route-status sr-only" aria-live="polite">${route.title}</div>`;
  root.querySelectorAll<HTMLAnchorElement>("a[data-route]").forEach(link => link.addEventListener("click", event => { event.preventDefault(); navigate(new URL(link.href).pathname); }));
  route.after?.();
  const title = root.querySelector<HTMLElement>("h1"); title?.setAttribute("tabindex", "-1"); title?.focus({ preventScroll: true });
  if (push) scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function detectedPlatform(): "mac" | "windows" | "linux" {
  const platform = navigator.userAgent.toLowerCase();
  return platform.includes("mac") ? "mac" : platform.includes("win") ? "windows" : "linux";
}

async function loadRelease(): Promise<void> {
  const actions = document.querySelector<HTMLElement>("#download-actions");
  const copy = document.querySelector<HTMLElement>("#platform-copy");
  if (!actions || !copy) return;
  const platform = detectedPlatform(); copy.textContent = `We detected ${platform === "mac" ? "macOS" : platform === "windows" ? "Windows" : "Linux"}.`;
  try {
    const cached = JSON.parse(localStorage.getItem("presence-bridge:release") || "null") as { time: number; data: Release } | null;
    const data = cached && Date.now() - cached.time < 3_600_000 ? cached.data : await fetch("https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases?per_page=1").then(async response => {
      if (!response.ok) throw new Error();
      const releases = await response.json() as Release[];
      if (!releases[0]) throw new Error();
      return releases[0];
    });
    localStorage.setItem("presence-bridge:release", JSON.stringify({ time: Date.now(), data }));
    const pattern = platform === "mac" ? /\.(dmg|app\.tar\.gz)$/i : platform === "windows" ? /\.(msi|exe)$/i : /\.(AppImage|deb)$/i;
    const asset = data.assets.find(item => pattern.test(item.name));
    if (!asset) throw new Error();
    actions.innerHTML = `<a class="primary-link" href="${asset.browser_download_url}">Download ${asset.name}</a><span>${data.tag_name} · ${(asset.size / 1_048_576).toFixed(1)} MB</span>`;
  } catch {
    actions.innerHTML = `<p>Downloads are being published. The source and release notes are available now.</p><a class="secondary-link" href="https://github.com/B-Divyesh/sf-presence-bridge/releases" rel="external">Check the release page</a>`;
  }
}

type Release = { tag_name: string; assets: { name: string; browser_download_url: string; size: number }[] };

captureLicense();
window.addEventListener("popstate", () => navigate(location.pathname, false));
navigate(location.pathname, false);
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
