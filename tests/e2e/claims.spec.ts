import { expect, test } from "@playwright/test";

test("@claim:contact-handoff opens a saved team tool", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("option", { name: /Ava Shah/ }).click();
  await page.getByRole("button", { name: /Slack/ }).click();
  await expect(page.locator(".toast")).toContainText("Opening Slack for Ava Shah");
});

test("@claim:privacy-local demo roster sends no data away", async ({ page }) => {
  const origins: string[] = [];
  page.on("request", request => origins.push(new URL(request.url()).origin));
  await page.goto("/demo");
  await page.locator("#own-status").selectOption("away");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Your note").fill("Back after lunch");
  await page.getByRole("button", { name: "Save settings" }).click();
  expect(origins.every(origin => origin === "http://127.0.0.1:4173")).toBe(true);
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
});
