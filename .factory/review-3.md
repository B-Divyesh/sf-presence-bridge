# Adversarial first-read review 3 — Presence Bridge

**Reviewed:** 2026-08-30

**Live target:** <https://presence-bridge.sociobot.in>

**Repository commit:** `36bcce4248e3d7be8557898b38cc5242552e5fd7`

**Verdict:** **FAIL**

**Findings:** 0 blocking · 8 minor

The product passes the cold-read, demo, declared-claim, sandbox, routing,
accessibility, and visual-identity checks. It does not meet the required
zero-finding standard because four public reliance statements are absent from
`.factory/claims.json`, and four README phrases violate the plain-word and
single-term rules.

## Cold first read

I opened `/` in fresh Chromium contexts at 390 × 844 and 1440 × 900. Before
scrolling, my answers were the same at both sizes:

- **What it does:** Shows a small team's chosen availability before opening an
  existing contact tool.
- **For whom:** Small teams that do not want to move conversations into another
  chat app.
- **What to click first:** **Try it with sample data**.

The exact first-screen text supplying those answers was **“See who is free
before you message”**, **“For small teams that need availability without moving
every conversation into another chat app”**, and **“Try it with sample data.”**
The privacy, offline, and free-limit facts also fit before the fold. At 390 px,
their bottoms were 618.80, 643.13, and 667.45 CSS pixels. At 1440 px, the last
fact ended at 898.30 pixels in the 900-pixel viewport. This gate passes.

## Findings

### F-3-1 — MINOR — License restoration is an unlisted product claim

**Exact quotes / locations:**

- Landing: **“Restore it in the desktop app Settings.”**
- README, Product limits and Bridge Plus: **“Existing licenses can be restored
  in Settings.”**
- `/terms`: **“Existing licenses can still be restored in Settings.”**
- App Settings: **“You can still restore an existing license below.”**

`claims.json` has `license-minimization`, which says what verification sends,
but no entry claims that an existing license can be restored. Its test happens
to obtain an active fixture verdict, but that does not list or name the public
restoration promise.

**Why this matters:** A license holder can rely on this behavior before opening
the app. The claims registry is presented as complete, so an incidental
assertion inside a differently named privacy test is not an explicit mapping.

**Concrete fix:** Add a `license-restore` entry and one tagged test that enters
a fixture token in a clean real roster, verifies it, reloads, and confirms the
Bridge Plus limits remain active. List every quoted surface in `where`.

### F-3-2 — MINOR — Status notes are an unlisted product claim

**Exact quotes / locations:**

- Landing preview: **“Read a clear status note before opening Slack, Teams,
  Meet, email, Zoom, or a phone link.”**
- Landing, How it works: **“Add a short note.”**
- README introduction: **“Each person has a clear status, note, and saved
  contact tool.”**

No claim entry states that a person can save and read a note. Existing tests
touch note fields while testing other outcomes, but no tagged claim asserts
that a saved note persists and is shown to a teammate.

**Why this matters:** The note explains availability and is part of the core
roster job, not decorative copy.

**Concrete fix:** Add a `status-note` claim and tagged test. Save a note in a
clean real roster, reload, and assert the selected person shows it. In demo
mode, assert the note writes only to the demo namespace and resets with the
sample.

### F-3-3 — MINOR — License deletion is broader than the registered privacy claim

**Exact quote / location:** `/privacy`, Delete your data: **“Clearing this
site's storage removes the local roster and license.”**

`privacy-local` lists roster, status, and imported calendar data. Its test
clears a roster but never creates and then clears a license token.

**Why this matters:** This is a privacy and account-removal promise. A visitor
must be able to verify that the license credential is removed too.

**Concrete fix:** Expand `privacy-local` to name the license token and update
its tagged test to set a fixture token, clear site storage, reload, and assert
that both the roster and license state are absent.

### F-3-4 — MINOR — “Merchant of record” is an unlisted payment claim

**Exact quote / locations:** `/terms` and App Settings: **“Sociobot is the
merchant of record.”**

No claim entry verifies this statement. `no-payment-runtime` proves that no
payment provider runs in the app; `checkout-availability` proves that checkout
is unavailable. Neither establishes the merchant relationship.

**Why this matters:** “Merchant of record” is a legal and payment statement a
buyer can rely on, even when checkout is temporarily unavailable.

**Concrete fix:** Remove the sentence while purchases are unavailable. When
checkout returns, add a payment-contract claim using a recorded Sociobot
checkout response that identifies the merchant and proves the displayed terms.

### F-3-5 — MINOR — README uses “sandbox” for the product's “demo”

**Exact quote / location:** README heading: **“Try the sandbox.”**

The landing page, banner, route, `.factory/demo.md`, and terminology table all
call this experience the **demo**. “Sandbox” introduces a second, more technical
term for the same thing.

**Concrete rewrite:** **“Try the demo.”**

### F-3-6 — MINOR — “Installed site” obscures which product surface works offline

**Exact quote / location:** README introduction: **“The installed site works
after the first visit, even offline.”**

The README otherwise distinguishes the browser site from the installed desktop
app. “Installed site” is neither of those established terms and implies that an
installation is required for the service-worker claim.

**Concrete rewrite:** **“After its first online visit, the browser app works
offline.”**

### F-3-7 — MINOR — The sharing boundary uses unexplained infrastructure jargon

**Exact quote / location:** README, Share a chosen status: **“This is the
sharing boundary: no activity tracking, message transport, contact scraping, or
hosted roster relay.”**

“Sharing boundary” and “hosted roster relay” describe implementation concepts,
not outcomes a small-team user can identify on first read.

**Concrete rewrite:** **“Presence Bridge does not track activity, carry
messages, copy contacts, or store your team roster online.”**

### F-3-8 — MINOR — “Publishing” and “watcher” introduce two more terms for sharing and folder watching

**Exact quote / location:** README, Share a chosen status: **“Publishing
remains an explicit download; the watcher never publishes your status.”**

The surrounding copy uses **share**, **download**, and **watch a shared folder**.
“Publishing” and “watcher” require the reader to translate the same actions into
new terms.

**Concrete rewrite:** **“Watching a folder only imports teammate updates. To
share your own status, download a new presence update.”**

## Demo and sandbox verification

- One click from `/` opened `/?demo=1` with four named teammates, the visitor's
  status, saved tools, and the persistent **“Demo — sample data, nothing is
  saved”** banner.
- At 390 × 844, Ava and Leo ended at 568.69 and 666.66 pixels; Noor also fit at
  764.63 pixels. On desktop, the first viewport showed the live app, current
  status, and Ava's selected detail while the roster continued immediately
  below.
- Changing status wrote only
  `sessionStorage["demo:presence-bridge:v1"]`; the real
  `localStorage["presence-bridge:v1"]` remained absent.
- **Reset demo** restored `available` and removed the demo key. **Start for
  real** removed the demo key, opened an empty real roster, and Browser Back
  restored the original sample. Closing and reopening was also covered by the
  passing tagged claim.
- The fresh landing-to-demo request log contained only
  `https://presence-bridge.sociobot.in`. No analytics, font CDN, model provider,
  calendar endpoint, or roster endpoint was requested.
- Live service-worker activation and offline reload passed in a fresh browser
  context with Ava still visible.

The demo gate passes; there is no blocking demo finding.

## Declared claim results

I cloned the GitHub repository into
`/tmp/presence-review3-gvsY0y/clone`, checked out
`36bcce4248e3d7be8557898b38cc5242552e5fd7`, ran `npm ci`, and ran every exact
`test` command from `.factory/claims.json` separately. Each command ran the 14
unit assertions and its tagged test in Chromium and the 390-pixel project.

| Claim | Result |
| --- | --- |
| `contact-handoff` | PASS |
| `privacy-local` | PASS |
| `transparent-presence` | PASS |
| `no-message-transport` | PASS |
| `calendar-local` | PASS |
| `offline-reload` | PASS |
| `free-limit` | PASS |
| `demo-isolation` | PASS |
| `demo-exit-discard` | PASS |
| `demo-seed-and-first-view` | PASS |
| `paid-roster` | PASS |
| `checkout-availability` | PASS |
| `license-minimization` | PASS |
| `json-backup` | PASS |
| `shared-presence` | PASS |
| `shared-folder-refresh` | PASS |
| `release-platforms` | PASS |
| `signing-configuration` | PASS |
| `no-payment-runtime` | PASS |
| `platform-download` | PASS |
| `release-checksums` | PASS |
| `release-fallback` | PASS |
| `linux-installer` | PASS |
| `windows-installer` | PASS |

Declared result: **24/24 PASS, 0 untested declared claims.** Findings F-3-1
through F-3-4 are unlisted claims, so the overall review still fails.

## Earlier finding verification

Every earlier finding was checked against the live site and current code, not
accepted from the polish reports.

| Earlier finding | Result and evidence |
| --- | --- |
| F-1-1 — demo state survived exit | **FIXED.** Live Reset, Start for real, Back, and a new context restore the seed; `src/app-core.ts` clears `DEMO_STORE`; both demo claims pass. |
| F-1-2 — unproved $24 price | **FIXED.** `$24` is absent from live copy and product source; the unavailable checkout surfaces and claim pass. |
| F-1-3 — mobile Privacy hidden | **FIXED.** Privacy is visible in the 390-pixel header with a 44-pixel target; no CSS hides the third link. |
| F-1-4 — third fact below fold | **FIXED.** All three fact bottoms are below 844 pixels on the live page. |
| F-1-5 — incomplete `/app.html` | **FIXED.** Live and source contain the route title, description, canonical, OG/Twitter tags, icons, manifest, Home/Privacy/Terms links, footer, and sitemap entry. |
| F-1-6 — stale route metadata / incomplete 404 | **FIXED.** Every route updates metadata; the live unknown route returns 404 with designed content, social metadata, and a home action. |
| F-1-7 — mood headings and inconsistent contact-tool terms | **FIXED for its exact quoted defects.** The old phrases are absent, headings name their sections, and `contact tool` is consistent. F-3-5 through F-3-8 identify different README terms. |
| F-1-8 — 25-word README privacy sentence | **FIXED.** It remains split into 10-word and 13-word sentences. |
| F-2-1 — mobile demo hid sample rows / count conflict | **FIXED.** Copy says four teammates plus the visitor; the first three live rows fit at 390 × 844; the tagged first-view claim passes. |
| F-2-2 — listed release, signing, demo-disposal, and payment claims were missing | **FIXED for every exact quoted claim.** The registry now has 24 entries and the added tagged commands pass. F-3-1 through F-3-4 are newly identified statements. |
| F-2-3 — copy audit was incomplete and miscounted | **FIXED.** The generator, committed audit, and drift test agree; all counts below use that whitespace method. |
| F-2-4 — Settings and Slack buttons lacked result verbs | **FIXED.** Live controls visibly say **Open settings** and **Open Slack**; code generates `Open {tool}`. |
| F-2-5 — status sharing required repeated manual imports | **FIXED.** The desktop implementation watches a user-chosen folder, imports only bounded `.presence.json` files, marks stale updates, and removes its grant on Stop watching. The tagged native-fixture claim passes. |

No earlier finding is unfixed, half-fixed, or regressed, so no earlier ID is
reissued as blocking.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` returned
  200. A new unknown path returned the designed 404 with HTTP 404.
- Every real route had `lang="en"`, one h1, one main landmark, a route-specific
  title, description, canonical, OG/Twitter metadata, favicon, apple-touch icon,
  consistent header, and footer legal links.
- Client navigation and Browser Back restored the URL, title, and h1 focus.
  Reloaded deep links retained the correct route.
- All discovered internal links, `sociobot.in`, the GitHub release page, the
  AppImage, `SHA256SUMS`, `latest.json`, favicon, OG image, robots, and sitemap
  returned 200 after redirects. `mailto:` was treated as an allowed scheme.
- The expected browser failed-resource message for the deliberate HTTP 404 was
  the only console error. No real route logged a console or page error.
- The live accessibility suite passed 32 tests with two desktop-project skips
  for mobile-only assertions: no serious/critical Axe findings, keyboard search
  and arrows, dialog focus return, 44-pixel mobile targets, 200% text, no
  overflow, route focus, and offline reload all passed.
- The visual identity is distinct rather than a generic SaaS template: original
  blue-hour office art, warm-window status lights, clipped architectural panels,
  brass bridge lines, Georgia/system type, and restrained one-shot motion match
  `.factory/design.md`. Reduced-motion CSS removes the animation.
- The full local gate passed: 14 Vitest assertions, 88 Playwright tests with two
  intentional project skips, TypeScript lint, and production build. `dist/site/`
  was produced; initial site JavaScript was 4.79 kB gzip and shared app JavaScript
  was 10.58 kB gzip.

## Missed leverage

No missing AI step is justified. Presence is deliberately chosen rather than
inferred, so an AI status guess would conflict with the brief. The obvious
non-AI leverage is already present: calendar import, JSON backup, explicit
presence-update export/import, and opt-in shared-folder refresh. No provider key
or decorative AI feature appears in the product.

## Copy audit

Counts use whitespace-separated words after Markdown is removed. The tables
include titles, descriptions, headings, prose, actions, labels, and image alt
text so the controls and context are auditable as well as grammatical
sentences. No entry exceeds 22 words and no banned marketing adjective appears.
`F-3-k` marks the findings above.

### Rendered landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Presence Bridge — See who is free before you message | 10 | — |
| See your small team's chosen status, then open the contact tool you already use. | 14 | — |
| No new inbox. | 3 | — |
| A local desktop roster | 4 | — |
| See who is free before you message | 7 | — |
| For small teams that need availability without moving every conversation into another chat app. | 14 | — |
| Try it with sample data | 5 | — |
| See four sample teammates and your status in one click. | 10 | — |
| Your roster stays on this device unless you share an update. | 11 | — |
| Works after the first visit, even offline. | 7 | — |
| Free for up to five people. | 6 | — |
| The product | 2 | — |
| Check a teammate and open a contact tool | 8 | — |
| Read a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 | F-3-2 |
| Reset demo | 2 | — |
| Start for real | 3 | — |
| Presence Bridge | 2 | — |
| Open settings | 2 | — |
| Who is free? | 3 | — |
| Your presence | 2 | — |
| Available · Free for a quick question | 7 | — |
| Status | 1 | — |
| Find a teammate | 3 | — |
| Name, role, or status | 4 | — |
| Add person | 2 | — |
| 4 people | 2 | — |
| Ava Shah · Design · available | 6 | — |
| Leo Martin · Engineering · busy | 6 | — |
| Noor Okafor · Operations · away | 6 | — |
| Mina Park · Accounts · offline | 6 | — |
| Reviewing the launch screens | 4 | — |
| Set manually | 2 | — |
| Open a contact tool | 4 | — |
| Open Slack | 2 | — |
| Edit person | 2 | — |
| Remove from roster | 3 | — |
| How it works | 3 | — |
| How to use the roster | 5 | — |
| Set your status | 3 | — |
| Choose available, busy, away, or offline. | 6 | — |
| Add a short note. | 4 | F-3-2 |
| Check the roster | 3 | — |
| See each teammate's status before you interrupt their work. | 9 | — |
| Open a contact tool | 4 | — |
| Start the conversation in the app your team already chose. | 10 | — |
| Privacy and sharing | 3 | — |
| Share status, not surveillance | 4 | — |
| Download a presence update when you want teammates to see it. | 11 | — |
| It carries only your chosen status fields. | 7 | — |
| Presence Bridge does not carry messages or infer activity. | 9 | — |
| Bridge Plus is not available in this release | 8 | — |
| Bridge Plus limits and contact tools | 6 | — |
| Bridge Plus supports up to ten people and two contact tools per person. | 13 | — |
| The free local roster holds five. | 6 | — |
| Bridge Plus purchases are not available right now. | 8 | — |
| The free five-person roster is ready now. | 7 | — |
| Already have a license? | 4 | — |
| Restore it in the desktop app Settings. | 7 | F-3-1 |
| See who is free, then open a contact tool. | 9 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v0.1.18 · Original generated artwork | 5 | — |
| A small studio with five warm windows beside a bridge at blue hour. | 13 | — |
| Presence settings with manual status and local calendar import. | 9 | — |
| The sample roster showing Leo as busy from his calendar. | 10 | — |
| A selected teammate with Slack and email contact tool buttons. | 10 | — |
| Presence Bridge home | 3 | — |
| Team roster | 2 | — |
| Selected teammate | 2 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Presence Bridge | 2 | — |
| See who is free, then open the contact tool you already use. | 12 | — |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 14 | — |
| Each person has a clear status, note, and saved contact tool. | 11 | F-3-2 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 | — |
| When a teammate shares a small presence update file, you can import it into your local roster. | 17 | — |
| The roster and imported `.ics` calendar events stay on this device. | 11 | — |
| A presence update leaves only when its owner downloads it. | 10 | — |
| It contains chosen status fields, not calendar events, contact tools, activity, or messages. | 13 | — |
| The installed site works after the first visit, even offline. | 10 | F-3-6 |
| These statements and each other product claim map to browser tests in `.factory/claims.json`. | 13 | F-3-1, F-3-2 |
| Try the sandbox | 3 | F-3-5 |
| Run the site and open `http://localhost:4173/?demo=1`, or use the hosted path: | 11 | — |
| The demo starts with four teammates and your status. | 9 | — |
| It uses the separate `demo:presence-bridge:v1` session key. | 7 | — |
| Resetting, leaving, or closing the demo discards its changes. | 9 | — |
| None of these actions changes the real roster. | 8 | — |
| Share a chosen status | 4 | — |
| Open Settings, choose Download presence update, then send that file using a shared folder or a contact tool. | 18 | — |
| A teammate imports it from the same Settings panel. | 9 | — |
| Updates never send automatically, and an imported status remains a local roster row. | 13 | — |
| This is the sharing boundary: no activity tracking, message transport, contact scraping, or hosted roster relay. | 16 | F-3-7 |
| The installed desktop app can watch a shared folder you choose. | 11 | — |
| It imports newer `.presence.json` files and marks updates older than one day as stale. | 14 | — |
| Choose Stop watching to remove the saved folder grant. | 9 | — |
| Publishing remains an explicit download; the watcher never publishes your status. | 11 | F-3-8 |
| Run and test | 3 | — |
| Requirements: Node.js 22, npm, Rust stable, and the Tauri 2 system packages. | 12 | — |
| `npm run build:site` is the static deploy command. | 8 | — |
| It writes `index.html` and all public assets to `dist/site/`. | 9 | — |
| Run the desktop shell during development: | 6 | — |
| Build the current platform package: | 5 | — |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. | 12 | — |
| Tagging `v*` creates the platform packages, `SHA256SUMS`, and `latest.json`. | 9 | — |
| The download page chooses your platform package. | 7 | — |
| It links to the release page if release information is unavailable. | 11 | — |
| For a terminal install, use the script for your platform. | 10 | — |
| The Linux script verifies `SHA256SUMS` before installing the AppImage. | 9 | — |
| The Windows release job verifies the setup checksum before it launches the installer. | 13 | — |
| Product limits and Bridge Plus | 5 | — |
| The free local roster holds five people with one contact tool each. | 12 | — |
| Bridge Plus supports ten people and two contact tools per person. | 11 | — |
| Bridge Plus is not available for purchase in this release. | 10 | — |
| The app shows no checkout link and keeps the free roster usable. | 12 | — |
| Existing licenses can be restored in Settings. | 7 | F-3-1 |
| No payment provider runs inside the app. | 7 | — |
| Presence Bridge does not transport messages or infer activity. | 9 | — |
| Keyboard and pointer activity never change presence. | 7 | — |
| It has no analytics or advertising trackers. | 7 | — |
| Project map | 2 | — |
| `src/app-core.ts`: roster, calendar import, contact tools, backup, and license state | 10 | — |
| `src-tauri/src/lib.rs`: tray behavior, native contact handoff checks, and shared-folder access | 10 | — |
| `src/site.ts`: landing pages, demo route, download detection, privacy, terms, and 404 | 11 | — |
| `src-tauri/`: Tauri tray shell and packaging configuration | 7 | — |
| `.github/workflows/release.yml`: cross-platform release builds | 4 | — |
| `.factory/design.md`: visual system and image provenance | 6 | — |
| `.factory/demo.md`: sandbox contract | 3 | — |
| `.factory/claims.json`: product claims and their tests | 6 | — |
| Deploy | 1 | — |
| Publish `dist/site/` at `https://presence-bridge.sociobot.in`. | 4 | — |
| The included `staticwebapp.config.json` maps the known app routes, serves a real 404, and supplies security headers. | 16 | — |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## What would make this perfect

Add explicit tagged claims for license restoration and status notes, expand the
privacy deletion test to cover the license token, and remove or prove the
merchant-of-record statement. Replace the four flagged README phrases with the
proposed plain-language text. Then rerun all 24 existing claims plus the new
claim commands, the complete copy audit, and the cold live checklist. At that
point there should be no finding left to carry into another round.
