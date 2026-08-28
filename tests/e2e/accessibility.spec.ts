import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/", "/demo", "/privacy", "/terms", "/download", "/missing-page", "/app.html"]) {
  test(`accessible page ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
    if (path === "/missing-page") {
      expect(errors.every(message => message.includes("404 (Not Found)"))).toBe(true);
    } else {
      expect(errors).toEqual([]);
    }
  });
}

test("unknown paths return the styled 404 on navigation and refresh", async ({ page }) => {
  const firstResponse = await page.goto("/missing-page");
  expect(firstResponse?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This path does not reach the roster" })).toBeVisible();
  const refreshResponse = await page.reload();
  expect(refreshResponse?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("a new service worker retires the old cache and reloads offline", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium");
  await page.goto("/demo");
  await page.evaluate(async () => {
    const existing = await navigator.serviceWorker.getRegistration();
    await existing?.unregister();
    for (const key of await caches.keys()) await caches.delete(key);
  });

  const activate = (build: string) => page.evaluate(async buildId => {
    const registration = await navigator.serviceWorker.register(`/sw.js?build=${buildId}`);
    const worker = registration.installing || registration.waiting || registration.active;
    if (worker && worker.state !== "activated") {
      await new Promise<void>(resolve => worker.addEventListener("statechange", () => {
        if (worker.state === "activated") resolve();
      }));
    }
    return caches.keys();
  }, build);

  expect(await activate("regression-old")).toContain("presence-bridge-regression-old");
  const updatedCaches = await activate("regression-new");
  expect(updatedCaches).toContain("presence-bridge-regression-new");
  expect(updatedCaches).not.toContain("presence-bridge-regression-old");

  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Try a complete team roster" })).toBeVisible();
  await expect(page.getByRole("option", { name: /Ava Shah/ })).toBeVisible();
});

test("keyboard search and roster navigation", async ({ page }) => {
  await page.goto("/demo");
  await page.keyboard.press("/");
  await expect(page.locator("#roster-search")).toBeFocused();
  await page.locator(".people").focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".person-row.selected")).toContainText("Leo Martin");
});
