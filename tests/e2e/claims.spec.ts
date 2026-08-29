import { expect, test } from "@playwright/test";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const backupMember = (index: number, routes = 1) => ({
  id: `member-${index}`,
  name: `Member ${index}`,
  role: "Team",
  initials: `M${index}`,
  status: "available",
  note: "Ready to help",
  source: "manual",
  tools: Array.from({ length: routes }, (_, route) => ({
    id: `member-${index}-route-${route}`,
    label: route ? "Phone" : "Email",
    url: route ? `tel:+1555000${index}` : `mailto:member-${index}@example.com`
  }))
});

const backupWithMembers = (count: number, routes = 1) => ({
  me: { id: "me", name: "You", role: "Studio lead", initials: "YO", status: "available", note: "Free", source: "manual", tools: [] },
  members: Array.from({ length: count }, (_, index) => backupMember(index + 1, routes)),
  calendar: [],
  calendarEnabled: false
});

const presenceUpdate = (name: string) => ({
  format: "presence-bridge-presence-v1",
  updatedAt: "2026-08-29T10:00:00.000Z",
  publisherId: `publisher-${name.toLowerCase().replaceAll(" ", "-")}`,
  person: { name, role: "Team", initials: "TM", status: "available", note: "Ready", source: "manual" }
});

test("@claim:contact-handoff opens a saved team tool", async ({ page }) => {
  await page.addInitScript(() => {
    window.open = ((url?: string | URL) => { document.documentElement.dataset.openedUrl = String(url); return null; }) as typeof window.open;
  });
  await page.goto("/app.html");
  await page.getByRole("button", { name: "Load sample project" }).click();
  await page.getByRole("option", { name: /Ava Shah/ }).click();
  await page.getByRole("button", { name: /Slack/ }).click();
  await expect(page.locator(".toast")).toContainText("Opening Slack for Ava Shah");
  await expect(page.locator("html")).toHaveAttribute("data-opened-url", /slack:\/\/user/);
});

test("@claim:privacy-local demo roster sends no data away", async ({ page }) => {
  const origins: string[] = [];
  page.on("request", request => origins.push(new URL(request.url()).origin));
  await page.goto("/demo");
  await page.locator("#own-status").selectOption("away");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Your note").fill("Back after lunch");
  await page.getByRole("button", { name: "Save settings" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  const now = new Date(); const later = new Date(now.getTime() + 3_600_000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  await page.locator("#calendar-file").setInputFiles({ name: "private.ics", mimeType: "text/calendar", buffer: Buffer.from(`BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${stamp(now)}\nDTEND:${stamp(later)}\nSUMMARY:Private review\nEND:VEVENT\nEND:VCALENDAR`) });
  expect(await page.evaluate(() => ({ demo: sessionStorage.getItem("demo:presence-bridge:v1"), real: localStorage.getItem("presence-bridge:v1") }))).toEqual(expect.objectContaining({ real: null }));
  await page.goto("/app.html");
  await page.getByRole("button", { name: "Load sample project" }).click();
  await expect(page.getByRole("option", { name: /Ava Shah/ })).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("Your roster is empty.")).toBeVisible();
  expect(origins.every(origin => origin === new URL(page.url()).origin)).toBe(true);
});

test("@claim:transparent-presence activity never changes a chosen status", async ({ page }) => {
  const requestOrigins: string[] = [];
  page.on("request", request => requestOrigins.push(new URL(request.url()).origin));
  await page.goto("/demo");
  await page.locator("#own-status").selectOption("away");
  await page.mouse.move(100, 100);
  await page.keyboard.type("work activity is not presence");
  await page.waitForTimeout(250);
  await expect(page.locator("#own-status")).toHaveValue("away");
  expect(requestOrigins.every(origin => origin === new URL(page.url()).origin)).toBe(true);
});

test("@claim:no-message-transport a handoff sends no message", async ({ page }) => {
  const requestOrigins: string[] = [];
  page.on("request", request => requestOrigins.push(new URL(request.url()).origin));
  await page.goto("/demo");
  await page.getByRole("option", { name: /Ava Shah/ }).click();
  await page.getByRole("button", { name: /Slack/ }).click();
  await expect(page.locator(".toast")).toHaveText("Opening Slack for Ava Shah.");
  expect(requestOrigins.every(origin => origin === new URL(page.url()).origin)).toBe(true);
});

test("@claim:checkout-availability keeps an unavailable checkout out of every purchase surface", async ({ page }) => {
  const checkoutRequests: { method: string; body: string | null }[] = [];
  await page.route("https://api.sociobot.in/api/v1/products/presence-bridge/checkout", async route => {
    checkoutRequests.push({ method: route.request().method(), body: route.request().postData() });
    await route.fulfill({ status: 404, contentType: "application/json", body: '{"error":"enabled factory product","status":404}' });
  });
  await page.goto("/");
  await expect(page.getByText("Bridge Plus · $24 once when available")).toBeVisible();
  await expect(page.getByText("Bridge Plus purchases are not available right now.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Buy Bridge Plus" })).toHaveCount(0);
  await page.goto("/app.html");
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("link", { name: "Buy Bridge Plus" })).toHaveCount(0);
  await expect(page.getByText("Bridge Plus purchases are not available right now.")).toBeVisible();
  expect(checkoutRequests).toEqual([]);
});

test("@claim:license-minimization sends only the license token for verification", async ({ page }) => {
  let captured: { url: string; method: string; body: string | null } | undefined;
  await page.route("https://api.sociobot.in/api/v1/products/presence-bridge/verify?license=*", async route => {
    const request = route.request();
    captured = { url: request.url(), method: request.method(), body: request.postData() };
    await route.fulfill({ json: { valid: true, reason: "ok" } });
  });
  await page.goto("/demo");
  await page.goto("/app.html");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Have a license?").fill("fixture-license");
  await page.getByRole("button", { name: "Verify license" }).click();
  await expect(page.locator(".toast")).toHaveText("Bridge Plus is active.");
  expect(captured).toEqual({
    url: "https://api.sociobot.in/api/v1/products/presence-bridge/verify?license=fixture-license",
    method: "GET",
    body: null
  });
});

test("@claim:json-backup downloads readable roster JSON", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Settings" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("presence-bridge-roster.json");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const backup = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { members: { name: string }[] };
  expect(backup.members.map(member => member.name)).toContain("Ava Shah");
});

test("@claim:calendar-local imports an ICS file without upload", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Settings" }).click();
  const now = new Date(); const later = new Date(now.getTime() + 3_600_000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  await page.locator("#calendar-file").setInputFiles({ name: "team.ics", mimeType: "text/calendar", buffer: Buffer.from(`BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${stamp(now)}\nDTEND:${stamp(later)}\nSUMMARY:Client review\nEND:VEVENT\nEND:VCALENDAR`) });
  await expect(page.locator(".toast")).toContainText("Imported 1 calendar event");
});

test("@claim:offline-reload works offline after the first visit", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium");
  await page.goto("/demo");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Try a complete team roster" })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Try a complete team roster" })).toBeVisible();
  await expect(page.getByRole("option", { name: /Ava Shah/ })).toBeVisible();
});

test("@claim:free-limit keeps five people in a free roster", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Add person" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Sam Rivera");
  await page.getByLabel("Role").fill("Support");
  await page.getByLabel("Contact link").fill("mailto:sam@example.com");
  await page.getByRole("button", { name: "Save person" }).click();
  await expect(page.locator(".roster-heading")).toContainText("5 people");

  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("#import-roster").setInputFiles({ name: "six-person-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backupWithMembers(6))) });
  await expect(page.locator(".toast")).toContainText("free roster holds five people");
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("demo:presence-bridge:v1") || "{}").members.length)).toBe(5);

  await page.locator("#import-presence").setInputFiles({ name: "sixth-person.presence.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(presenceUpdate("Sixth Person"))) });
  await expect(page.locator(".toast")).toContainText("free roster holds five people");
  await expect(page.locator(".roster-heading")).toContainText("5 people");

  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Add person" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Iris Bell");
  await page.getByLabel("Contact link").fill("mailto:iris@example.com");
  await page.getByRole("button", { name: "Save person" }).click();
  await expect(page.locator(".toast")).toContainText("free roster holds five people");
});

test("@claim:demo-isolation never copies sample data into the real roster", async ({ page }) => {
  await page.goto("/demo");
  await page.locator("#own-status").selectOption("away");
  await page.goto("/app.html");
  await expect(page.getByText("Your roster is empty.")).toBeVisible();
});

test("@claim:paid-roster enables ten people and a second route", async ({ page }) => {
  await page.route("https://api.sociobot.in/api/v1/products/presence-bridge/verify?license=*", route => route.fulfill({ json: { valid: true, reason: "ok" } }));
  await page.goto("/app.html");
  await page.evaluate(() => localStorage.setItem("sb_license:presence-bridge", "test-license"));
  await Promise.all([page.waitForResponse(response => response.url().includes("/verify?license=")), page.reload()]);
  await page.getByRole("button", { name: "Add person" }).click();
  await expect(page.getByLabel("Second contact link")).toBeVisible();
  for (let index = 1; index <= 10; index += 1) {
    await page.getByLabel("Name", { exact: true }).fill(`Teammate ${index}`);
    await page.getByLabel("Contact link", { exact: true }).fill(`mailto:member${index}@example.com`);
    await page.getByRole("button", { name: "Save person" }).click();
    if (index < 10) await page.getByRole("button", { name: "Add person" }).click();
  }
  await expect(page.locator(".roster-heading")).toContainText("10 people");
  await page.getByRole("button", { name: "Add person" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Eleven Person");
  await page.getByLabel("Contact link", { exact: true }).fill("mailto:eleven@example.com");
  await page.getByRole("button", { name: "Save person" }).click();
  await expect(page.locator(".toast")).toContainText("limit to ten");

  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("#import-roster").setInputFiles({ name: "ten-person-paid-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backupWithMembers(10, 2))) });
  await expect(page.locator(".toast")).toHaveText("Roster backup imported.");
  await expect(page.locator(".roster-heading")).toContainText("10 people");
});

test("@claim:shared-presence carries a chosen status between isolated local rosters", async ({ browser, baseURL }) => {
  const appUrl = new URL("/app.html", baseURL || "http://127.0.0.1:4173").toString();
  const senderContext = await browser.newContext();
  const sender = await senderContext.newPage();
  await sender.goto(appUrl);
  await sender.getByRole("button", { name: "Settings" }).click();
  await sender.getByLabel("Your name").fill("Nia Flores");
  await sender.getByRole("button", { name: "Save settings" }).click();
  await sender.locator("#own-status").selectOption("away");
  await sender.getByRole("button", { name: "Settings" }).click();
  const downloadPromise = sender.waitForEvent("download");
  await sender.getByRole("button", { name: "Download presence update" }).click();
  const update = await downloadPromise;
  const updatePath = await update.path();
  expect(updatePath).toBeTruthy();
  const buffer = await readFile(updatePath!);
  const parsed = JSON.parse(buffer.toString("utf8"));
  expect(parsed).toMatchObject({ person: { name: "Nia Flores", status: "away" } });
  expect(parsed.publisherId).not.toBe("unassigned");
  expect(JSON.stringify(parsed)).not.toContain("tools");
  expect(JSON.stringify(parsed)).not.toContain("calendar");

  const receiverContext = await browser.newContext();
  const receiver = await receiverContext.newPage();
  await receiver.goto(appUrl);
  await receiver.getByRole("button", { name: "Settings" }).click();
  await receiver.locator("#import-presence").setInputFiles({ name: "nia.presence.json", mimeType: "application/json", buffer });
  await expect(receiver.locator(".toast")).toContainText("Nia Flores's chosen presence was added");
  await expect(receiver.getByRole("option", { name: /Nia Flores/ })).toContainText("away");
  await senderContext.close();
  await receiverContext.close();
});

test("@claim:platform-download selects the detected platform package from release metadata", async ({ page }) => {
  await page.route("https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases?per_page=1", route => route.fulfill({ json: [{
    tag_name: "v0.1.6", assets: [
      { name: "Presence.Bridge_0.1.6_amd64.AppImage", size: 79_000_000, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/Presence.Bridge_0.1.6_amd64.AppImage" },
      { name: "Presence.Bridge_0.1.6_x64-setup.exe", size: 60_000_000, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/Presence.Bridge_0.1.6_x64-setup.exe" }
    ]
  }] }));
  const userAgent = await page.evaluate(() => navigator.userAgent.toLowerCase());
  const expected = userAgent.includes("win") ? "Presence.Bridge_0.1.6_x64-setup.exe" : "Presence.Bridge_0.1.6_amd64.AppImage";
  await page.goto("/download");
  await expect(page.getByRole("link", { name: `Download ${expected}` })).toHaveAttribute("href", new RegExp(expected.replaceAll(".", "\\.") + "$"));
});

test("@claim:release-checksums shows the checksum and manifest shipped with a release", async ({ page }) => {
  await page.route("https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases?per_page=1", route => route.fulfill({ json: [{
    tag_name: "v0.1.6", assets: [
      { name: "Presence.Bridge_0.1.6_amd64.AppImage", size: 79_000_000, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/Presence.Bridge_0.1.6_amd64.AppImage" },
      { name: "Presence.Bridge_0.1.6_x64-setup.exe", size: 60_000_000, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/Presence.Bridge_0.1.6_x64-setup.exe" },
      { name: "SHA256SUMS", size: 1_200, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/SHA256SUMS" },
      { name: "latest.json", size: 900, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.6/latest.json" }
    ]
  }] }));
  await page.goto("/download");
  await expect(page.getByRole("link", { name: "Check SHA256SUMS" })).toHaveAttribute("href", /SHA256SUMS$/);
  await expect(page.getByRole("link", { name: "Read latest.json" })).toHaveAttribute("href", /latest\.json$/);
});

test("@claim:release-fallback gives a usable release-page link when metadata is unavailable", async ({ page }) => {
  await page.route("https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases?per_page=1", route => route.fulfill({ status: 503 }));
  await page.goto("/download");
  await expect(page.getByText("Downloads are being published. The source and release notes are available now.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Check the release page" })).toHaveAttribute("href", "https://github.com/B-Divyesh/sf-presence-bridge/releases");
});

test("@claim:linux-installer installs only a checksum-verified AppImage", async () => {
  const temp = await mkdtemp(join(tmpdir(), "presence-bridge-installer-"));
  const bin = join(temp, "bin");
  const fakeBin = join(temp, "fake-bin");
  const appName = "Presence.Bridge_0.1.6_amd64.AppImage";
  const app = join(temp, appName);
  const payload = "#!/bin/sh\necho Presence Bridge fixture\n";
  const checksum = createHash("sha256").update(payload).digest("hex");
  try {
    await mkdir(fakeBin);
    await writeFile(app, payload, { mode: 0o755 });
    const curl = `#!/bin/sh
out=""
url=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -*) shift ;;
    *) url="$1"; shift ;;
  esac
done
case "$url" in
  *releases/latest) printf '%s' '{"assets":[{"name":"${appName}","browser_download_url":"https://fixture.invalid/${appName}"},{"name":"SHA256SUMS","browser_download_url":"https://fixture.invalid/SHA256SUMS"}]}' > "$out" ;;
  *${appName}) cp "$FAKE_APP" "$out" ;;
  *SHA256SUMS) printf '%s  %s\\n' "$FAKE_SHA" "${appName}" > "$out" ;;
  *) exit 1 ;;
esac
`;
    const curlPath = join(fakeBin, "curl");
    await writeFile(curlPath, curl, { mode: 0o755 });
    await chmod(curlPath, 0o755);
    const environment = { ...process.env, PATH: `${fakeBin}:${process.env.PATH}`, XDG_BIN_HOME: bin, FAKE_APP: app, FAKE_SHA: checksum };
    await execFileAsync("sh", [resolve("public/install.sh")], { env: environment });
    const { stdout } = await execFileAsync(join(bin, "presence-bridge"));
    expect(stdout).toContain("Presence Bridge fixture");
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("@claim:windows-installer verifies its setup before launch in the Windows release job", async () => {
  const [installer, workflow] = await Promise.all([readFile("public/install.ps1", "utf8"), readFile(".github/workflows/release.yml", "utf8")]);
  expect(installer.indexOf("Checksum failed. The setup was not run.")).toBeLessThan(installer.indexOf("Start-Process -FilePath $installer"));
  expect(installer).toContain("Get-FileHash $installer -Algorithm SHA256");
  expect(workflow).toContain("windows-installer-smoke:");
  expect(workflow).toContain("run: ./public/install.ps1");
});

test("backup import rejects malformed state, preserves the prior roster, and reloads safely", async ({ page }) => {
  await page.goto("/demo");
  await page.locator("#own-status").selectOption("away");
  const before = await page.evaluate(() => sessionStorage.getItem("demo:presence-bridge:v1"));
  await page.getByRole("button", { name: "Settings" }).click();
  await page.locator("#import-roster").setInputFiles({ name: "malformed.json", mimeType: "application/json", buffer: Buffer.from('{"me":{},"members":[{}]}') });
  await expect(page.locator(".toast")).toContainText("It was not saved");
  expect(await page.evaluate(() => sessionStorage.getItem("demo:presence-bridge:v1"))).toBe(before);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Try a complete team roster" })).toBeVisible();
  await expect(page.getByRole("option", { name: /Ava Shah/ })).toBeVisible();
});

test("a legacy malformed saved backup fails closed without blanking the app", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("presence-bridge:v1", '{"me":{},"members":[{}]}'));
  await page.goto("/app.html");
  await expect(page.getByRole("heading", { name: "Who is free?" })).toBeVisible();
  await expect(page.getByText("Your roster is empty.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("calendar-derived status changes at an imported event boundary without reload", async ({ page }) => {
  test.setTimeout(20_000);
  await page.goto("/demo");
  await page.getByRole("button", { name: "Settings" }).click();
  const now = new Date();
  const start = new Date(now.getTime() - 10_000);
  const end = new Date(now.getTime() + 3_000);
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, "SUMMARY:Boundary meeting", "END:VEVENT", "END:VCALENDAR"].join("\n");
  await page.locator("#calendar-file").setInputFiles({ name: "boundary.ics", mimeType: "text/calendar", buffer: Buffer.from(ics) });
  await expect(page.locator(".status-summary")).toContainText("busy · Boundary meeting");
  await expect(page.locator(".status-summary")).toContainText("available · Calendar is clear", { timeout: 7_000 });
});
