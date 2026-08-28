# Presence Bridge visual thesis

## Direction

**Cinematic environmental art: the last lit office at blue hour.** Presence is represented as a row of warm windows across a quiet, rain-dark courtyard. Each window is voluntary: a person turns their own light on, away, or off. Fine bridge lines connect the roster to the communication tools people already use. The scene makes the narrow job legible without turning colleagues into surveillance dots.

This is a deliberately dark, single-mode interface. A bright light theme would weaken the night-window metaphor and add glare to a tray companion that remains open beside work. Contrast is designed and tested within the dark treatment.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `--night` | `#09151a` | page and app background |
| `--deep-water` | `#10252b` | raised surfaces |
| `--glass` | `#17333a` | controls and secondary surfaces |
| `--paper` | `#f4f0df` | primary text |
| `--mist` | `#b8c8c5` | secondary text |
| `--lantern` | `#f2b84b` | primary action and available state |
| `--lantern-ink` | `#241a08` | text on lantern |
| `--reed` | `#8ec5a1` | success and calendar-derived state |
| `--ember` | `#e88363` | busy and errors |
| `--slate` | `#829298` | away/offline state |

All body text combinations meet WCAG AA at 16px. Status always includes a word and never relies on color alone.

## Type

- Display: **Georgia**, with restrained letter spacing. Its editorial shapes bring human warmth to the night scene.
- Interface and body: **system UI** (`Inter`-like platform stack). It keeps roster scanning crisp without a font download.
- Tabular figures are enabled for time and counts.

No font files or third-party font requests are needed.

## Spacing and shape

- 8px base rhythm: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Content measure: 68 characters. Wide sections use an asymmetric 5/7 split.
- Corners are clipped at one corner, like architectural plans, rather than uniformly rounded SaaS cards.
- Rules and connection lines are thin brass strokes. Cards exist only for independent people or settings.
- Touch targets are at least 44px. Desktop density increases inside the roster, not in controls.

## Interaction grammar

- A status change is a light being switched: the dot brightens once and the live region names the new state.
- Tool handoff actions show the destination before opening a documented deep link.
- The roster supports arrow-key movement, Enter to open the preferred tool, and `/` to focus search.
- Demo mode has a persistent brass-edged banner and a separate `demo:presence-bridge:v1` storage namespace.
- Destructive roster deletion requires a named confirmation. Demo reset is immediate because demo data is disposable.

## Motion

The signature motion is a single 650ms light trail crossing the hero bridge on first view. Interface transitions use 180–240ms opacity and transform changes. Nothing loops. With `prefers-reduced-motion`, the trail is fully drawn and all state changes are instant.

## Art plan and prompt sheet

### Hero environment

- Subject: a small shared studio across a narrow canal at blue hour; five distinct warm windows imply five colleagues.
- World: quiet compact city, rainy air, old brick and glass, no people visible, no branded signage.
- Materials: wet stone, dark oxidized metal, soft window glass, faint mist.
- Light: cinematic deep teal dusk with warm amber windows; practical, restrained contrast.
- Lens: 35mm, slightly elevated, wide horizontal composition. Negative space in the upper left for copy.
- Palette words: deep water, blue-hour teal, brass lantern, warm paper, muted reed.
- Negative list: no text, no watermark, no logos, no readable signs, no dramatic neon, no cyberpunk, no people, no surveillance cameras, no phones, no UI mockups.

Prompt used: “A cinematic wide environmental illustration of a small independent studio across a narrow rain-dark canal at blue hour, five distinct warm windows glowing in an old brick and glass building, a modest footbridge in the foreground suggesting connection, quiet compact city, wet stone and oxidized metal, faint mist, deep teal shadows and restrained amber light, painterly realism with fine film grain, 35mm slightly elevated composition, generous dark negative space at upper left, calm and trustworthy, no people visible, no text, no watermark, no logos, no readable signs, no neon cyberpunk, no surveillance cameras, no phones, no interface.”

The source image is generated for this project with the factory image model on 2026-08-28. It is original project artwork. The source PNG and prompt sidecar are kept under `assets/src/`; optimized WebP derivatives ship in `public/assets/`.

## App layout

The desktop window uses a compact title bar and two-pane structure: status controls and searchable roster on the left; selected teammate with explicit tool handoffs on the right. At 760px the detail pane becomes an in-flow section. At 390px the site and app stack; lower-priority atmosphere is cropped, while all actions remain visible.

## Landing rhythm

The first screen is asymmetrical: plain copy sits over night sky at left, while the illuminated studio occupies the lower/right field. A live roster preview overlaps the canal edge. Later sections transition through horizontal “walkways” rather than a grid of generic feature cards. The 404 page shows one unlit window and a single lit path home.
