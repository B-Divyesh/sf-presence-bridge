# Presence Bridge

See who is free, then open the contact tool you already use.

Presence Bridge is a local desktop roster for teams of two to ten people. Each person has a clear status, note, and saved contact tool. The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. When a teammate shares a small presence update file, you can import it into your local roster.

The roster and imported `.ics` calendar events stay on this device. A presence update leaves only when its owner downloads it. It contains chosen status fields, not calendar events, contact tools, activity, or messages. After its first online visit, the browser app works offline. These statements and each other product claim map to browser tests in [`.factory/claims.json`](.factory/claims.json).

## Try the demo

Run the site and open `http://localhost:4173/?demo=1`, or use the hosted path:

```text
https://presence-bridge.sociobot.in/?demo=1
```

The demo starts with four teammates and your status. It uses the separate `demo:presence-bridge:v1` session key. Resetting, leaving, or closing the demo discards its changes. None of these actions changes the real roster.

## Share a chosen status

Open **Settings**, choose **Download presence update**, then send that file using a shared folder or a contact tool. A teammate imports it from the same Settings panel. Updates never send automatically, and an imported status remains a local roster row. Presence Bridge does not track activity, carry messages, copy contacts, or store your team roster online.

The installed desktop app can watch a shared folder you choose. It imports newer `.presence.json` files and marks updates older than one day as stale. Choose **Stop watching** to remove the saved folder grant. Watching a folder only imports teammate updates. To share your own status, download a new presence update.

## Run and test

Requirements: Node.js 22, npm, Rust stable, and the [Tauri 2 system packages](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev
npm test
npm run audit:copy
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

Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. Tagging `v*` creates the platform packages, `SHA256SUMS`, and `latest.json`. The download page chooses your platform package. It links to the release page if release information is unavailable.

For a terminal install, use the script for your platform. The Linux script verifies `SHA256SUMS` before installing the AppImage. The Windows release job verifies the setup checksum before it launches the installer.

```sh
curl -fsSL https://presence-bridge.sociobot.in/install.sh | sh
```

```powershell
irm https://presence-bridge.sociobot.in/install.ps1 | iex
```

## Product limits and Bridge Plus

The free local roster holds five people with one contact tool each. Bridge Plus supports ten people and two contact tools per person. Bridge Plus is not available for purchase in this release. The app shows no checkout link and keeps the free roster usable. Existing licenses can be restored in Settings. No payment provider runs inside the app.

Presence Bridge does not transport messages or infer activity. Keyboard and pointer activity never change presence. It has no analytics or advertising trackers.

## Project map

- `src/app-core.ts`: roster, calendar import, contact tools, backup, and license state
- `src-tauri/src/lib.rs`: tray behavior, native contact handoff checks, and shared-folder access
- `src/site.ts`: landing pages, demo route, download detection, privacy, terms, and 404
- `src-tauri/`: Tauri tray shell and packaging configuration
- `.github/workflows/release.yml`: cross-platform release builds
- `.factory/design.md`: visual system and image provenance
- `.factory/demo.md`: sandbox contract
- `.factory/claims.json`: product claims and their tests

## Deploy

Publish `dist/site/` at `https://presence-bridge.sociobot.in`. The included `staticwebapp.config.json` maps the known app routes, serves a real 404, and supplies security headers. Infrastructure, DNS, product registration, and signing stay outside this repository.

## License

MIT. See [LICENSE](LICENSE).
