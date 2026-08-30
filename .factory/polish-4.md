# Polish round 4

## Result

All 26 findings from adversarial reviews 1–4 are resolved in release v0.1.22. The repair source is commit `992682353261f38d2bd3be260dbbba132ea72dbf`. The deployed site is [presence-bridge.sociobot.in](https://presence-bridge.sociobot.in), and the matching desktop release is [v0.1.22](https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.22).

Evidence paths below are relative to the repository. The live browser record is `.factory/evidence/polish-4/live-browser-check.json`; the full claim record is `.factory/evidence/polish-4/claim-results.json`.

## Finding matrix

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `Start for real` now removes the isolated `demo:` namespace before opening the real app; demo changes never enter `presence-bridge:*`. | Claim `@claim:demo-exit-discard`; `.factory/evidence/polish-4/live-mobile-demo-one-click.png`; cold live `/?demo=1` reset and exit checks both found no demo or real keys. |
| F-1-2 | Removed the unsupported $24 price and replaced checkout copy with an honest unavailable state. | Claims `@claim:checkout-availability` and `@claim:no-payment-runtime`; `.factory/evidence/polish-4/live-desktop-home.png`; cold live `/` contains no price or checkout promise. |
| F-1-3 | Kept Privacy in the mobile header instead of hiding navigation. | Test `keeps the Privacy link visible on the first mobile screen`; `.factory/evidence/polish-4/live-mobile-first-screen.png`; cold live `/` confirmed the Privacy link is visible at 390×844. |
| F-1-4 | Compacted the first screen so all three evidence lines fit at 390×844. | Test `keeps all three first-screen facts visible at 390x844`; `.factory/evidence/polish-4/live-mobile-first-screen.png`; live measured final fact bottom 667.45 px within an 844 px viewport. |
| F-1-5 | Gave `/app.html` its own title, description, canonical URL, social metadata, legal links, and sitemap entry. | Tests `gives the installed browser app complete route metadata` and `keeps app legal links navigable`; `.factory/evidence/polish-4/live-app/screenshot-mobile.png`; live `/app.html` verified as `Presence app — Presence Bridge`. |
| F-1-6 | Added route-specific metadata, History API focus restoration, and a designed server-backed 404. | Tests `sets complete route metadata`, `moves focus to each route heading`, and `serves a designed 404`; `.factory/evidence/polish-4/live-desktop-home.png`; live `/privacy` title/focus and `/missing-route` 404 status/title passed. |
| F-1-7 | Replaced “scrambling”, “see the bridge”, “one small protocol”, and phone-specific handoff copy with direct product language and “contact tool”. | Copy audit `copy stays concrete and current wording avoids reviewed jargon`; `.factory/evidence/polish-4/live-desktop-home.png`; cold live `/` shows the revised contact-tool wording. |
| F-1-8 | Split the README privacy paragraph into short, single-purpose sentences. | `npm run audit:copy`; `.factory/evidence/polish-4/live-privacy.png`; live `/privacy` uses the same direct privacy terms. |
| F-2-1 | Made `?demo=1` one-click and immediately useful on mobile with Ava, Marco, and Priya visible without setup. | Claim `@claim:demo-seed-and-first-view`; `.factory/evidence/polish-4/live-mobile-demo-one-click.png`; cold live `/?demo=1` measured all three sample rows. |
| F-2-2 | Added executable claims for platform artifacts, signing state, payment-provider boundaries, detected downloads, checksums, fallback, and both installer scripts. | Claims `@claim:release-platforms` through `@claim:windows-installer`; `.factory/evidence/polish-4/live-download-mobile.png`; live `/download` resolved to the v0.1.22 AppImage and the release provenance/checksum checks passed. |
| F-2-3 | Rebuilt the copy audit so it covers public routes, `/app.html`, README, native UI, and emitted runtime strings. | `npm run audit:copy` and test `audits every shipped interface surface`; `.factory/evidence/polish-4/live-app/screenshot-desktop.png`; cold live page strings matched the audited build. |
| F-2-4 | Changed vague actions to explicit verbs, including status-note and folder actions. | Test `uses explicit verbs for important actions`; `.factory/evidence/polish-4/live-app/screenshot-desktop.png`; live `/app.html` exposes named actions rather than generic submit labels. |
| F-2-5 | Implemented actual shared-folder watching in the Tauri core with bounded `.json` reads and reload behavior. | Rust test `shared_folder_reads_only_bounded_presence_files`, claims `@claim:shared-presence` and `@claim:shared-folder-refresh`; `.factory/evidence/polish-4/live-app/screenshot-desktop.png`; live `/app.html` explains the native folder behavior. |
| F-3-1 | Added license restore to the privacy claim and verifies both token and cached verdict are deleted on clear-data. | Claims `@claim:license-restore`, `@claim:license-minimization`, and expanded `@claim:privacy-local`; `.factory/evidence/polish-4/live-privacy.png`; cold live `/privacy` names license removal. |
| F-3-2 | Added a dedicated status-note claim that proves another roster entry renders the saved note. | Claim `@claim:status-note`; `.factory/evidence/polish-4/live-mobile-demo-one-click.png`; cold live demo displays realistic teammate notes. |
| F-3-3 | Updated privacy wording so clearing browser data explicitly includes any stored license. | Expanded claim `@claim:privacy-local`; `.factory/evidence/polish-4/live-privacy.png`; cold live `/privacy` contains the deletion statement. |
| F-3-4 | Removed the unsupported “merchant of record” sentence. | Test `does not make merchant-of-record assertions`; `.factory/evidence/polish-4/live-terms/screenshot-mobile.png`; cold live `/terms` contains no merchant assertion. |
| F-3-5 | Replaced user-facing “sandbox” with “demo” everywhere. | Copy audit `uses demo consistently in user-facing copy`; `.factory/evidence/polish-4/live-mobile-demo-one-click.png`; live banner reads `Demo — sample data, nothing is saved`. |
| F-3-6 | Replaced “installed site” with “browser app”. | Copy audit `uses browser app consistently`; `.factory/evidence/polish-4/live-app/screenshot-mobile.png`; cold live `/app.html` uses “browser app”. |
| F-3-7 | Replaced vague “details” and “complete signal” language with “status fields” and “available fields”. | Copy audit `avoids reviewed jargon and vague field terms`; `.factory/evidence/polish-4/live-mobile-demo-one-click.png`; cold live demo uses the revised field language. |
| F-3-8 | Replaced “release assets are still being published” and watcher jargon with direct download and folder wording. | Test `shows the calm fallback when release discovery fails` plus copy audit; `.factory/evidence/polish-4/live-download-mobile.png`; live `/download` resolved the release without jargon. |
| F-4-1 | Serialized Playwright workers and isolated both offline/service-worker tests in their own browser contexts with guaranteed online cleanup. | Two consecutive clean-clone `npm test` runs each passed 15 unit tests and 92 Playwright tests with 2 intentional skips; `@claim:release-checksums` passed after each offline test. Screenshot `.factory/evidence/polish-4/live-download-mobile.png`; the same full suite passed against the live URL. |
| F-4-2 | Expanded the local-data claim to save and delete profile settings, shared-folder choice, roster, license token, and cached verdict. | Expanded claim `@claim:privacy-local`; `.factory/evidence/polish-4/live-privacy.png`; cold live `/privacy` explicitly names profile settings and shared-folder choice. |
| F-4-3 | Expanded the tracker claim to crawl every public route, inspect outgoing requests, scan dependencies and production imports, and reject named ad/analytics providers. | Expanded claim `@claim:transparent-presence`; `.factory/evidence/polish-4/live-desktop-home.png`; live cold crawl found only same-origin and GitHub API requests, with no tracker requests. |
| F-4-4 | Removed the decorative eyebrow “The product”. | Test `keeps public copy factual`; `.factory/evidence/polish-4/live-mobile-first-screen.png`; cold live `/` confirmed the label is absent. |
| F-4-5 | Replaced subjective “clear” wording with observable status-note and availability behavior in the site and README. | Test `keeps public copy factual` and `npm run audit:copy`; `.factory/evidence/polish-4/live-mobile-first-screen.png`; cold live `/` shows `Read a teammate's status note, then open your contact tool.` |

## Verification summary

- Clean clone: `npm ci`, lint, copy audit, two consecutive full `npm test` runs, build, and `npm audit --audit-level=high` all passed.
- Claims: all 26 commands in `.factory/claims.json` passed verbatim from the clean clone.
- Native: format check, locked check/test, and clippy with warnings denied passed.
- Accessibility and browser: local and live route verifier passed six routes; Playwright accessibility tests passed; live Lighthouse scored 100 in all four categories.
- Privacy and offline: full live suite passed; offline reload retained Ava while offline; live link/header crawl found 0 failures.
- Release: all six workflow jobs passed; exact source provenance passed; a downloaded Debian artifact matched `SHA256SUMS`.
- Deployment: all 24 public live files match the local `dist/site` hashes.
