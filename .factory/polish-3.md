# Presence Bridge — perfection loop round 3

## Result

All 21 findings from adversarial reviews 1–3 are resolved. The repaired product is v0.1.19 at source commit `3a1c0740362341ae7115d3533a1b60276f9e8572`. The static site is live at <https://presence-bridge.sociobot.in>, and the desktop release is at <https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.19>.

## Finding matrix

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | **Start for real**, Reset, Back, and tab close discard the `demo:presence-bridge:v1` state without reading or writing the real roster. | `@claim:demo-exit-discard`; `@claim:demo-isolation`; live one-click capture `.factory/evidence/polish-3/live-mobile-demo-one-click.png`; live `/?demo=1` reset/exit check ended with zero real rows. |
| F-1-2 | Removed the unproved `$24` price and kept Bridge Plus purchase surfaces in an honest unavailable state. | `@claim:checkout-availability`; repository search found no `$24`; live `/terms` and app Settings passed the full live suite. |
| F-1-3 | Kept Privacy in the compact three-link mobile header with a 44 px target. | `390px first screen keeps Privacy and all three facts visible`; `.factory/evidence/polish-3/live-mobile-first-screen.png`; live Privacy target was y=8–52 at 390 px. |
| F-1-4 | Kept all three privacy, offline, and free-limit facts inside the 390 × 844 first screen. | Same mobile test and screenshot; live fact bottoms were 619, 643, and 667 CSS px. |
| F-1-5 | Preserved complete `/app.html` metadata, legal navigation, home link, footer, icons, manifest, and sitemap coverage. | `the real roster route has complete metadata and legal navigation`; `accessible page /app.html`; `.factory/evidence/polish-3/live-app/verify.json`; live `/app.html`. |
| F-1-6 | Preserved per-route title, description, canonical, Open Graph/Twitter metadata, History focus, and the designed HTTP 404. | `site routes update metadata, history, and heading focus`; `unknown paths return the styled 404 on navigation and refresh`; live `/missing-page` returned 404 with title `Page not found — Presence Bridge`. |
| F-1-7 | Preserved task-led headings and the single term **contact tool** across the site, app, and README. | `the committed copy audit matches rendered copy and README`; `npm run audit:copy`; `.factory/copy-audit.md`; `.factory/evidence/polish-3/live-home/screenshot-desktop.png`. |
| F-1-8 | Preserved the split README privacy sentences under the 22-word limit. | Copy-audit drift test and generated word counts pass. |
| F-2-1 | Preserved the accurate promise of four sample teammates plus the visitor; compact demo layout places three named rows inside the first mobile viewport. | `@claim:demo-seed-and-first-view`; `.factory/evidence/polish-3/live-mobile-demo-one-click.png`; live row bottoms were 569, 667, 765, and 864 px. |
| F-2-2 | Preserved explicit claims for demo disposal, release platforms, signing configuration, and payment-runtime absence. The complete registry now has 26 entries. | `@claim:demo-exit-discard`, `@claim:release-platforms`, `@claim:signing-configuration`, `@claim:no-payment-runtime`; claims contract unit test; all 26 exact commands passed from the clean clone. |
| F-2-3 | Preserved generated copy auditing for rendered copy, alt text, controls, README prose, and whitespace word counts. | `npm run audit:copy`; `the committed copy audit matches rendered copy and README`; `.factory/copy-audit.md`. |
| F-2-4 | Preserved visible verb-led actions **Open settings** and **Open {contact tool}**. | `@claim:contact-handoff`; live demo screenshot above shows **Open settings** and **Open Slack**. |
| F-2-5 | Preserved the opt-in desktop folder watcher, bounded `.presence.json` reads, refresh, stale marker, and removable folder grant. | `@claim:shared-folder-refresh`; Rust `reads_only_bounded_presence_files`; `cargo test --locked`; v0.1.19 Linux and Windows installer smoke jobs passed. |
| F-3-1 | Added the explicit `license-restore` claim. Its test enters a fixture token in a clean real roster, verifies it, reloads, and confirms active ten-person/two-tool limits. | `@claim:license-restore`; `.factory/evidence/polish-3/live-license-restore.png`; live `/app.html` fixture check showed **Bridge Plus is active** after reload. |
| F-3-2 | Added the explicit `status-note` claim. Its test persists a real person's note through reload and proves a demo note uses only the demo namespace and resets to the sample. | `@claim:status-note`; `.factory/evidence/polish-3/live-status-note.png`; live `/app.html` showed Rina Patel's `Free until 3 pm` note after reload. |
| F-3-3 | Expanded `privacy-local` to include the license token. The test creates a roster and verified license, clears site storage, reloads, and asserts roster, token, and cached verdict are all absent. | `@claim:privacy-local`; exact assertions for `presence-bridge:v1`, `sb_license:presence-bridge`, and `presence-bridge:license-verdict`; live `/privacy`. |
| F-3-4 | Removed **Sociobot is the merchant of record** from Terms and app Settings while checkout is unavailable. | Repository search found no phrase in product copy; `@claim:checkout-availability`; `@claim:no-payment-runtime`; live `/terms` and Settings check. |
| F-3-5 | Replaced README **Try the sandbox** with **Try the demo**. | `the committed copy audit matches rendered copy and README`; copy audit records `Try the demo`. |
| F-3-6 | Replaced **The installed site works…** with **After its first online visit, the browser app works offline.** | `@claim:offline-reload`; copy-audit drift test; live fresh-context offline reload passed. |
| F-3-7 | Rewrote the README boundary as concrete outcomes: no activity tracking, message carrying, contact copying, or online roster storage. | `@claim:privacy-local`; `@claim:no-message-transport`; copy-audit drift test. |
| F-3-8 | Replaced **publishing/watcher** jargon with **Watching a folder only imports teammate updates. To share your own status, download a new presence update.** | `@claim:shared-folder-refresh`; generated copy audit; Rust bounded-file test. |

## Clean-clone and live evidence

- Clean clone: `/tmp/presence-bridge-polish3-krkKBI/clone` at `3a1c0740362341ae7115d3533a1b60276f9e8572` after `npm ci`.
- Every one of the 26 exact `.factory/claims.json` commands ran separately and passed in Chromium and the 390 px mobile project: 26/26 commands, 52 matched browser claim runs.
- Clean-clone `npm test`: 14 unit assertions and 92 browser tests passed; two desktop-project skips are the mobile-only 390 px checks.
- Clean-clone lint, generated copy audit, production build, and high-severity dependency audit passed.
- Native checks passed: `cargo fmt --check`, `cargo check --locked`, `cargo test --locked`, and `cargo clippy --all-targets -- -D warnings`.
- Full live `npm test`: 14 unit assertions and 92 browser tests passed; two expected desktop-project skips.
- Live verifier reports zero console or structural errors for `/`, `/?demo=1`, and `/app.html` in `.factory/evidence/polish-3/live-*/verify.json`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.43 s, TBT 35 ms, CLS 0, total transfer 149,338 bytes. Raw report: `.factory/evidence/polish-3/lighthouse.json`.
- GitHub Actions run <https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33284547730> passed macOS, Windows, Linux, manifest, Linux installer smoke, and Windows installer smoke jobs.
- Published `latest.json` names source commit `3a1c0740362341ae7115d3533a1b60276f9e8572` and 2 macOS, 2 Windows, and 3 Linux packages. The downloaded Debian package matched `SHA256SUMS` at `3cc65ee1a616c290d1c3e297a4aaf2b8f0c594f63495ed6ed51d273681f89603`.

No finding from reviews 1, 2, or 3 remains unresolved.
