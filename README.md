# Presence Bridge

See who is free, then open the chat tool you already use.

Presence Bridge is a local desktop roster for teams of two to ten people. Each person has a clear status, note, and saved contact link. The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox.

The roster and imported `.ics` calendar events stay on this device. The installed site works after the first visit, even offline. These statements and each other product claim map to browser tests in [`.factory/claims.json`](.factory/claims.json).

## Try the sandbox

Run the site and open `http://localhost:4173/demo`, or use the hosted path:

```text
https://presence-bridge.sociobot.in/demo
```

The demo starts with four colleagues and several contact tools. It uses the separate `demo:presence-bridge:v1` session key. Resetting or closing it does not change the real roster.

## Run and test

Requirements: Node.js 22, npm, Rust stable, and the [Tauri 2 system packages](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev
npm test
npm run build:site
```

`npm run build:site` is the static deploy command. It writes `index.html` and all public assets to `dist/site/`.

Run the desktop shell during development:

```sh
npm run tauri dev
```

Build the current platform package:

```sh
npm run tauri build
```

Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. Tagging `v*` creates the platform packages, checksums, and `latest.json`. The download page reads release metadata from the GitHub API and has a calm fallback when no release exists.

## Product limits and price

The free local roster holds five people with one contact route each. Bridge Plus costs $24 once. It raises the limit to ten and adds a second contact route. Checkout and license verification use the Sociobot billing API; no payment provider runs inside the app.

Presence Bridge does not transport messages, scrape contacts, infer activity, or monitor employees. It has no analytics or advertising trackers.

## Project map

- `src/app-core.ts`: roster, calendar import, contact handoffs, backup, and license state
- `src/site.ts`: landing pages, demo route, download detection, privacy, terms, and 404
- `src-tauri/`: Tauri tray shell and packaging configuration
- `.github/workflows/release.yml`: cross-platform release builds
- `.factory/design.md`: visual system and image provenance
- `.factory/demo.md`: sandbox contract
- `.factory/claims.json`: product claims and their tests

## Deploy

Publish `dist/site/` at `https://presence-bridge.sociobot.in`. The included `staticwebapp.config.json` supplies SPA fallback and security headers. Infrastructure, DNS, product registration, and signing stay outside this repository.

## License

MIT. See [LICENSE](LICENSE).
