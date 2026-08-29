# Adversarial first-read review 2 — Presence Bridge

**Reviewed:** 2026-08-29  
**Live target:** `https://presence-bridge.sociobot.in`  
**Repository base:** `a0d07180eea0192f2f6395766130c025656cebd9`  
**Verdict:** **FAIL**

The landing page explains the product within one screen, all 19 declared claim
commands pass, and storage isolation works. The review still fails because the
one-click demo does not show the promised roster in the first phone viewport,
public claims remain outside the claims registry, and minor copy and workflow
gaps remain. A PASS requires zero findings.

## Cold first read

I opened `/` in new browser contexts at 390 × 844 and 1440 × 900. Before
scrolling, I understood:

- **What it does:** shows a small team's chosen availability, then opens the
  contact tool they already use.
- **For whom:** small teams that do not want to move their conversations into
  another chat app.
- **What to click first:** **Try it with sample data**.

The exact first-screen copy that supplied those answers was “See who is free
before you message,” “For small teams that need availability without moving
every conversation into another chat app,” and “Try it with sample data.” The
privacy, offline, and free-limit facts were also visible without scrolling at
both sizes. This gate passes.

## Findings

### F-2-1 — BLOCKING — The one-click demo does not show the promised roster in its first phone screen

**Location / exact evidence:** The landing action says **“Try it with sample
data”** and **“See a five-person roster in one click.”** After one click in a
fresh 390 × 844 context, the first viewport contains the demo-page introduction,
banner, app header, “Who is free?”, and the start of **Your presence**. The first
teammate row starts at 1,096 CSS pixels, below the 844-pixel viewport. After
scrolling, the roster itself says **“4 PEOPLE”** and contains Ava Shah, Leo
Martin, Noor Okafor, and Mina Park. The README separately says **“The demo
starts with four colleagues and several contact tools.”** The `/demo` metadata
calls it **“an isolated five-person sample roster.”**

**Why this fails:** A phone visitor does not see the product's central evidence—
a teammate roster—on the first screen after using the demo action. The visible
count also contradicts the action's literal “five-person roster” promise. The
user may infer that the author counted “You” as a fifth team member, but the UI
labels only the four teammate rows as the roster. This is a weak demo under the
one-click sandbox requirement and an unlisted count claim.

**Concrete fix:** On mobile, remove or collapse the duplicate demo-page
introduction so the persistent banner, current status, and at least two named
teammate rows appear in the first 844 pixels. Then either seed five teammate
rows or rewrite every count consistently to **“See four sample teammates and
your status in one click.”** Add one `demo-seed-and-first-view` claim whose
Playwright test opens the landing page at 390 × 844, clicks once, asserts the
declared row count, and confirms at least one realistic teammate row is inside
the viewport.

### F-2-2 — MINOR — Several public reliance claims have no claims.json entry

**Location / exact quotes:** None of the following has an exact claim entry and
tagged sandbox test:

- README: **“Resetting, leaving, or closing the demo discards its changes.”**
  `demo-exit-discard` tests leaving and returning, but not the Reset action or a
  close-and-reopen path.
- `/download`: **“Release files are unsigned until the project owner adds
  signing certificates.”** and **“macOS and Windows may show an unsigned app
  warning.”**
- `/download`: **“Linux releases include AppImage and Debian packages.”**
- README: **“Desktop releases are built by GitHub Actions on macOS, Windows,
  and Linux.”** and **“Tagging `v*` creates the platform packages,
  `SHA256SUMS`, and `latest.json`.”** The registered release tests exercise a
  recorded download response and checksum links, not the three-platform/tag
  outcome.
- README: **“No payment provider runs inside the app.”** The registered
  checkout claim proves that no purchase link or checkout request appears when
  checkout is unavailable; it does not state or test the broader provider claim.
- README: **“These statements and each other product claim map to browser tests
  in `.factory/claims.json`.”** The claims above make that sentence false.

**Why this fails:** A visitor can rely on demo deletion, signing state, package
availability, release production, and payment boundaries. Passing the 19 listed
tests does not cover claims that were never listed.

**Concrete fix:** Add exact entries and one tagged test per claim. A demo test
must exercise Reset and close/reopen. A release-platform test must inspect the
recorded release assets and tagged workflow output. A no-payment-runtime test
must record requests while opening Settings and inspect the production import
graph. Remove the absolute signing statements if the clean sandbox cannot prove
them; keep the neutral checksum instruction. Update the meta-claim only after
the registry is complete.

### F-2-3 — MINOR — The required copy-audit artifact is incomplete and miscounts 13 items

**Location / exact evidence:** `.factory/copy-audit.md` says **“Count method:
words separated by spaces.”** Its recorded counts do not follow that method.
Examples include **“See who is free before you message”** as 8 instead of 7,
**“Presence Bridge is a local desktop roster for teams of two to ten people.”**
as 13 instead of 14, and the `staticwebapp.config.json` sentence as 14 instead
of 16. The 13 incorrect entries are: `8→7`, `6→7`, `8→7`, `13→14`, `6→7`,
`12→13`, `15→16`, `11→12`, `10→11`, `12→13`, `11→12`, `11→12`, and `14→16`
in their existing table order. It also omits the landing image alt sentences,
the README requirements sentence, and the README's `MIT.` / `See LICENSE.`
sentences.

**Why this fails:** The artifact is the claimed proof that all copy was checked.
Incorrect counts and omissions make that proof non-reproducible, even though no
current sentence exceeds 22 words.

**Concrete fix:** Regenerate `.factory/copy-audit.md` from rendered text and
README prose using one whitespace-counting function. Include alt text,
accessible control names, requirements, and license sentences. Add a test that
fails when the generated audit differs from the committed file.

### F-2-4 — MINOR — Two visible demo buttons do not name their result with a verb

**Location / exact quotes:** The embedded product preview and `/demo` expose
buttons labelled **“Settings”** and **“Slack”**. The Settings button has an
accessible label of “Open settings,” but sighted visitors see only the noun.
The Slack button's accessible name is also only “Slack.”

**Why this fails:** A first-time visitor must infer whether these controls open,
select, or configure something. The adjacent headings help, but each button
should remain clear when scanned alone.

**Concrete fix:** Show **“Open settings”** and **“Open Slack”**. Generate each
contact-tool button as **“Open {tool name}”** while preserving the saved tool
name elsewhere in the detail panel.

### F-2-5 — MINOR — Teammate status updates still require a manual file handoff every time

**Location / exact quote:** README, **Share a chosen status**: **“Open Settings,
choose Download presence update, then send that file using a shared folder or a
contact tool. A teammate imports it from the same Settings panel.”**

**Why this fails:** The core job is checking whether a teammate is free now.
Repeated download, send, and import steps make status stale unless every person
manually repeats them after each change. A normal small team would expect the
explicitly shared local status file to refresh without a fresh import each time.

**Concrete fix:** Add an optional **Watch a shared folder** flow in the desktop
app. After the user grants a folder, import changed `.presence.json` files,
show each update time, mark stale entries, and provide **Stop watching**. Keep
publishing explicit and opt-in; do not add activity inference or a hosted relay.
List and test the behavior as a new local-sync claim. AI would not improve this
workflow and is not warranted.

## Demo, sandbox, and network evidence

- One click reaches `/?demo=1` with the persistent **“Demo — sample data,
  nothing is saved”** banner, Reset, and Start for real.
- The sample has four named colleagues, four distinct states, useful notes, and
  Slack, Teams, Meet, and email tools. F-2-1 records the first-viewport failure.
- Changing status writes only `sessionStorage["demo:presence-bridge:v1"]`.
  `localStorage["presence-bridge:v1"]` stayed null throughout the fresh flow.
- Reset restored `available` and removed the demo key. Start for real removed
  the demo key; Back recreated the original sample with `available` selected.
- The complete landing → demo → edit → reset → real → Back request log contained
  only `https://presence-bridge.sociobot.in` origins.
- A fresh live context registered the service worker, reloaded once, went
  offline, and reloaded `/demo` with HTTP 200 from cache; Ava Shah remained
  available in the sample.

## Declared claim results

I cloned `a0d07180eea0192f2f6395766130c025656cebd9` into
`/tmp/presence-review2-HinXP8`, ran `npm ci`, and ran every exact command from
`.factory/claims.json` separately. All declared tests passed.

| Claim id | Result |
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
| `paid-roster` | PASS |
| `checkout-availability` | PASS |
| `license-minimization` | PASS |
| `json-backup` | PASS |
| `shared-presence` | PASS |
| `platform-download` | PASS |
| `release-checksums` | PASS |
| `release-fallback` | PASS |
| `linux-installer` | PASS |
| `windows-installer` | PASS |

The full clean-clone gate also passed: 13 Vitest tests, 76 Playwright tests,
two intentional desktop-only skips, `npm run lint`, and `npm run build`.
The build produced `dist/site/` with 14.33 KB gzip of initial JavaScript.

## Earlier finding verification

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1, demo exit retained state | **CONFIRMED FIXED.** Live Reset and Start for real remove the demo key; Back restores the seed. The tagged exit and isolation tests pass. |
| F-1-2, untested `$24` price | **CONFIRMED FIXED.** No `$24` appears in current public copy or product source. Checkout unavailability is tagged and passes. |
| F-1-3, mobile Privacy hidden | **CONFIRMED FIXED.** Privacy is visible at 390 px; no CSS rule hides it. |
| F-1-4, third mobile fact below fold | **CONFIRMED FIXED.** The three fact bottoms are 596, 621, and 645 px in an 844-pixel viewport. |
| F-1-5, incomplete `/app.html` | **CONFIRMED FIXED.** Live title, description, canonical, OG/Twitter, icons, manifest, Home/Privacy/Terms, footer, and sitemap entry are present. |
| F-1-6, stale route metadata / incomplete 404 | **CONFIRMED FIXED.** Each route updates its metadata. An unknown deep link returns the designed page with HTTP 404 and complete social metadata. |
| F-1-7, mood headings / inconsistent user terms | **CONFIRMED FIXED.** The flagged live phrases are absent and visible product copy consistently uses “contact tool.” F-2-4 is a new action-label issue, not a recurrence of the former terminology problem. |
| F-1-8, 25-word README sentence | **CONFIRMED FIXED.** It is split into 10-word and 13-word sentences. |

## Structure, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` return 200;
  the tested unknown path returns the designed 404 with HTTP 404.
- Every route has `lang="en"`, one h1, one main landmark, a route-specific title,
  description, canonical, OG/Twitter metadata, favicon, and apple-touch icon.
- Header and footer navigation expose Home/wordmark, Privacy, Terms, and the
  appropriate product actions. The sitemap contains every real route.
- Client-side navigation and browser Back restore the correct URL and focus the
  new h1. Reloaded deep links keep their route.
- The link crawl returned 200 for all intended internal links, the factory link,
  the GitHub release page, the AppImage, `SHA256SUMS`, and `latest.json`.
  `mailto:` links were treated as allowed schemes. The 404 page's same-document
  skip link correctly remains on the 404 response.
- The supplied verification script passed `/`, `/demo`, and `/app.html` with no
  console errors, missing alt text, or unnamed buttons. Playwright Axe found no
  violations on all six real routes at 390 px.
- The visual identity is distinct: blue-hour office artwork, warm-window status
  lights, clipped architectural panels, and restrained brass lines match
  `.factory/design.md`; it is not a generic gradient-card SaaS template.

## Copy audit

Counts below use whitespace-separated rendered words. Repeated proper names,
status options, initials, and navigation nouns are labels rather than sentences;
all sentence-like prose, headings, actions, error text, metadata prose, and alt
text are listed. No sentence exceeds 22 words and no banned marketing adjective
appears. `†` marks a finding.

### Landing page

| Copy | Words |
| --- | ---: |
| A local desktop roster | 4 |
| See who is free before you message | 7 |
| For small teams that need availability without moving every conversation into another chat app. | 14 |
| Try it with sample data | 5 |
| See a five-person roster in one click. † F-2-1 | 7 |
| Your roster stays on this device unless you share an update. | 11 |
| Works after the first visit, even offline. | 7 |
| Free for up to five people. | 6 |
| The product | 2 |
| Check a teammate and open a contact tool | 8 |
| Read a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 |
| Demo — sample data, nothing is saved | 7 |
| Reset demo | 2 |
| Start for real | 3 |
| Who is free? | 3 |
| Your presence | 2 |
| Free for a quick question | 5 |
| Find a teammate | 3 |
| Name, role, or status | 4 |
| Add person | 2 |
| 4 people | 2 |
| Reviewing the launch screens | 4 |
| Set manually | 2 |
| Open a contact tool | 4 |
| Settings † F-2-4 | 1 |
| Slack † F-2-4 | 1 |
| Edit person | 2 |
| Remove from roster | 3 |
| That contact tool link is not supported. | 7 |
| Use a mailto, https, Slack, Teams, Zoom, or phone link. | 10 |
| How it works | 3 |
| How to use the roster | 5 |
| Set your status | 3 |
| Choose available, busy, away, or offline. | 6 |
| Add a short note. | 4 |
| Check the roster | 3 |
| See each teammate's status before you interrupt their work. | 9 |
| Open a contact tool | 4 |
| Start the conversation in the app your team already chose. | 10 |
| Privacy and sharing | 3 |
| Share status, not surveillance | 4 |
| Download a presence update when you want teammates to see it. | 11 |
| It carries only your chosen status fields. | 7 |
| Presence Bridge does not carry messages or infer activity. | 9 |
| Bridge Plus is not available in this release | 8 |
| Bridge Plus limits and contact tools | 6 |
| Bridge Plus supports up to ten people and two contact tools per person. | 13 |
| The free local roster holds five. | 6 |
| Bridge Plus purchases are not available right now. | 8 |
| The free five-person roster is ready now. | 7 |
| Already have a license? | 4 |
| Restore it in the desktop app Settings. | 7 |
| See who is free, then open a contact tool. | 9 |
| Original generated artwork | 3 |
| See your small team's chosen status, then open the contact tool you already use. | 14 |
| No new inbox. | 3 |
| A small studio with five warm windows beside a bridge at blue hour. | 13 |
| Presence settings with manual status and local calendar import. | 9 |
| The sample roster showing Leo as busy from his calendar. | 10 |
| A selected teammate with Slack and email contact tool buttons. | 10 |

The headings make sense out of context. “Share status, not surveillance” states
the privacy boundary rather than serving as mood copy. “Roster,” “status,”
“contact tool,” “calendar,” “Bridge Plus,” “demo,” and “presence update” are
used consistently. Only the button labels and demo count are flagged.

### README

| Sentence | Words |
| --- | ---: |
| See who is free, then open the contact tool you already use. | 12 |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 14 |
| Each person has a clear status, note, and saved contact tool. | 11 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 |
| When a teammate shares a small presence update file, you can import it into your local roster. | 17 |
| The roster and imported `.ics` calendar events stay on this device. | 11 |
| A presence update leaves only when its owner downloads it. | 10 |
| It contains chosen status fields, not calendar events, contact tools, activity, or messages. | 13 |
| The installed site works after the first visit, even offline. | 10 |
| These statements and each other product claim map to browser tests in `.factory/claims.json`. † F-2-2 | 13 |
| Run the site and open `http://localhost:4173/?demo=1`, or use the hosted path. | 11 |
| The demo starts with four colleagues and several contact tools. † F-2-1 | 10 |
| It uses the separate `demo:presence-bridge:v1` session key. | 7 |
| Resetting, leaving, or closing the demo discards its changes. † F-2-2 | 9 |
| None of these actions changes the real roster. | 8 |
| Open Settings, choose Download presence update, then send that file using a shared folder or a contact tool. † F-2-5 | 18 |
| A teammate imports it from the same Settings panel. † F-2-5 | 9 |
| Updates never send automatically, and an imported status remains a local roster row. | 13 |
| This is the sharing boundary: no activity tracking, message transport, contact scraping, or hosted roster relay. | 16 |
| Requirements: Node.js 22, npm, Rust stable, and the Tauri 2 system packages. | 12 |
| `npm run build:site` is the static deploy command. | 8 |
| It writes `index.html` and all public assets to `dist/site/`. | 9 |
| Run the desktop shell during development: | 6 |
| Build the current platform package: | 5 |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. † F-2-2 | 12 |
| Tagging `v*` creates the platform packages, `SHA256SUMS`, and `latest.json`. † F-2-2 | 9 |
| The download page chooses your platform package. | 7 |
| It links to the release page if release information is unavailable. | 11 |
| For a terminal install, use the script for your platform. | 10 |
| The Linux script verifies `SHA256SUMS` before installing the AppImage. | 9 |
| The Windows release job verifies the setup checksum before it launches the installer. | 13 |
| The free local roster holds five people with one contact tool each. | 12 |
| Bridge Plus supports ten people and two contact tools per person. | 11 |
| Bridge Plus is not available for purchase in this release. | 10 |
| The app shows no checkout link and keeps the free roster usable. | 12 |
| Existing licenses can be restored in Settings. | 7 |
| No payment provider runs inside the app. † F-2-2 | 7 |
| Presence Bridge does not transport messages or infer activity. | 9 |
| Keyboard and pointer activity never change presence. | 7 |
| It has no analytics or advertising trackers. | 7 |
| Publish `dist/site/` at `https://presence-bridge.sociobot.in`. | 4 |
| The included `staticwebapp.config.json` maps the known app routes, serves a real 404, and supplies security headers. | 16 |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 |
| MIT. | 1 |
| See LICENSE. | 2 |

README headings also pass the out-of-context test: **Presence Bridge** (2),
**Try the sandbox** (3), **Share a chosen status** (4), **Run and test** (3),
**Product limits and Bridge Plus** (5), **Project map** (2), **Deploy** (1), and
**License** (1). Technical words such as `.ics`, Tauri, `SHA256SUMS`, and
`staticwebapp.config.json` occur only in operator instructions where they name
the exact format, dependency, or file; they are not unexplained marketing copy.

## What would make this perfect

Put realistic teammate rows inside the first post-click phone viewport and make
the sample count consistent. Register or remove every remaining public claim,
regenerate the copy audit with correct counts, use result-naming button text,
and add an opt-in shared-folder refresh path for teammate updates. Then rerun
the complete cold-read, claims, storage, offline, route, link, and accessibility
checks from a fresh clone and fresh browser contexts.
