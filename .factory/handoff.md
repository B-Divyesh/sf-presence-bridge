# Presence Bridge — adversarial review 4 handoff

## Result

**FAIL — 1 blocking and 4 minor findings.**

The full report is in `.factory/review-4.md`. No product code was changed.

The cold read, one-click sample demo, storage isolation, offline reload, live
request boundary, route metadata, back-button focus, 404, link crawl,
accessibility checks, and visual identity pass. All 26 exact commands from
`.factory/claims.json` pass independently.

The blocking defect is the required full `npm test` gate. From a clean clone it
failed twice at the same mobile `@claim:release-checksums` fixture setup after
Chromium headless-shell received `SIGSEGV`; both runs ended with 91 passed, 2
skipped, and 1 failed. The isolated release-checksums claim command passes.

The four minor findings are an unlisted device-only settings privacy claim, an
unlisted advertising-tracker claim, the decorative landing label **“The
product”**, and subjective **“clear”** wording in the landing page and README.

## Verification performed

- Fresh 390 × 844 and 1440 × 900 cold browser contexts against the live URL.
- Live one-click demo edit, Reset, Start for real, Back, session/local storage,
  request-origin, console, and offline-reload checks.
- Every exact `.factory/claims.json` command from clean clone
  `/tmp/presence-review4-claims-HyZDjT/clone`: 26/26 passed.
- `npm run lint`: passed.
- `npm run audit:copy`: passed, 2/2 browser projects.
- `npm run build`: passed and produced `dist/site/`.
- `npm test`: failed reproducibly twice as described above.
- Factory `verify-url.sh` against `/`, `/demo`, `/privacy`, `/terms`,
  `/download`, and `/app.html`: all passed with no console/page errors.
- Live metadata/heading/landmark/link sweep plus designed HTTP 404 check.
- All 21 findings from reviews 1–3 were checked live and in code; each remains
  fixed.

## Repair verification

After addressing F-4-1 through F-4-5, run:

```sh
npm ci
npm run lint
npm run audit:copy
npm test
npm run build
```

Run every exact command in `.factory/claims.json` separately, then repeat
`npm test` from a clean clone to confirm the browser crash is gone. Recheck the
live site at 390 × 844 and desktop after deployment.
