# Polish round 1 acceptance map

Base review: `3a1b68d962143fcdb12a4aa68a6f68f0dc563353`

Deployed repair: `2b917731c0ced162f59141cb8a01bd444016e031`

Live URL: <https://presence-bridge.sociobot.in>

The base contained `.factory/review-1.md` and no earlier review or polish
reports. Every finding in that report is mapped below.

| Finding | Change made | Automated evidence | Visual and live evidence |
| --- | --- | --- | --- |
| F-1-1 | Start for real now deletes `demo:presence-bridge:v1` synchronously. Returning with Browser Back creates the original sample seed instead of restoring edited demo state. Real storage is never read or written by the demo. | `@claim:demo-exit-discard restores the seed after leaving the demo`; `@claim:demo-isolation never copies sample data into the real roster`; claim entry `demo-exit-discard` in `.factory/claims.json`. | `.factory/evidence/polish-1/demo-exit-reset.png`; `.factory/evidence/polish-1/live-demo-exit-reset.png`; `live-check.json` reports both storage keys `null` and `statusAfterBack: "available"` at `/?demo=1`. |
| F-1-2 | Removed every public `$24` statement. Terms and settings now state that Bridge Plus is not available in this release; checkout behavior remains an explicitly tested availability state. | `@claim:checkout-availability explains when checkout is unavailable`; full repository/copy tests; `.factory/claims.json` has no unproved price claim. | Cold live crawl of `/`, `/terms`, and app settings found no `$24`; `live-check.json` has `noDollar24` and `noDollar24Live` true. |
| F-1-3 | Reworked the compact header so Privacy remains visible beside Download and Try demo at 390 px. | `390px first screen keeps Privacy and all three facts visible`; `390px routes and download names reflow without horizontal scrolling and keep touch targets`. | `.factory/evidence/polish-1/mobile-first-screen.png`; `.factory/evidence/polish-1/live-mobile-first-screen.png`; live check has `privacyVisible: true` and document/client width 390/390. |
| F-1-4 | Tightened only the phone hero rhythm and type scale while retaining the product’s blue-hour composition. All three first-screen facts now fit before 844 px. | `390px first screen keeps Privacy and all three facts visible`. | Live fact bottoms are 596.47, 620.80, and 645.13 px in `live-check.json`; screenshots above show the complete first screen. |
| F-1-5 | Completed `/app.html` title, description, canonical, Open Graph, Twitter, favicon, app manifest, home wordmark, Privacy/Terms navigation, Param Factory/version footer, responsive layout, and sitemap entry. | `the real roster route has complete metadata and legal navigation`; `accessible page /app.html`; `390px routes and download names reflow without horizontal scrolling and keep touch targets`. | `.factory/evidence/polish-1/app-route-mobile.png`; `.factory/evidence/polish-1/live-app-route.png`; live title/canonical/legal targets and sitemap entries recorded in `live-check.json` and handoff. |
| F-1-6 | Added per-route metadata models and updates for title, description, canonical, Open Graph, Twitter, and URL. Route transitions and back/forward focus the page h1. The designed 404 now has complete social metadata and returns HTTP 404. | `site routes update metadata, history, and heading focus`; `unknown paths return the styled 404 on navigation and refresh`; `accessible page /missing-page`. | `live-check.json` records distinct metadata for `/demo`, `/privacy`, `/terms`, `/download`, plus 404 status/title/Open Graph title. `.factory/evidence/polish-1/privacy-route.png`. |
| F-1-7 | Replaced metaphor headings and jargon with task headings, rewrote the hero for a five-second first read, and standardized the concept name to “contact tool” across site, app, README, tests, and documentation. | `.factory/copy-audit.md` contains the sentence count audit and terminology table; all entries are at most 22 words and contain no banned terms. Unit, browser, and copy assertions passed. | `.factory/evidence/polish-1/desktop-home.png`; cold live copy check has `noFlaggedPhrases: true`. |
| F-1-8 | Split the 25-word README privacy sentence into two short sentences and synchronized README wording with the product. | README/copy audit review and the complete test/build gate. | Cold fetch of the published README confirmed both sentences; `live-check.json` has `splitPrivacy: true`. |

## Cross-cutting acceptance evidence

- All 19 claim commands passed independently from fresh clone
  `/tmp/presence-bridge-claims-DObWXN` at the deployed repair commit.
- `npm ci && npm test && npm run build:site`: 9 unit tests and 74 browser
  tests passed; two configured project skips were intentional.
- Standalone live Axe: zero violations on five representative routes. Evidence:
  `.factory/evidence/polish-1/live-axe.json`.
- Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO;
  LCP 1.5 s, CLS 0, TBT 30 ms. Evidence:
  `.factory/evidence/polish-1/lighthouse.json`.
- Live deployed JavaScript matches the tested `dist/site` file byte-for-byte.
- The post-deploy cold check found no unresolved finding of any severity.
