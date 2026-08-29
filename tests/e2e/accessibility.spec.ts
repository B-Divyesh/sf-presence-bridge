import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/", "/demo", "/privacy", "/terms", "/download", "/missing-page", "/app.html"]) {
  test(`accessible page ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter(item => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
    if (path === "/missing-page") {
      expect(response?.status()).toBe(404);
      // Vite reports "404 (Not Found)", while Azure Static Web Apps reports
      // "status of 404 ()". Both are the expected request for this real 404.
      expect(errors.every(message => /404 \(Not Found\)|status of 404/.test(message))).toBe(true);
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
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Page not found — Presence Bridge");
});

test("site routes update metadata, history, and heading focus", async ({ page }) => {
  const metadata = [
    ["/demo", "Demo — Presence Bridge", "Try Presence Bridge with an isolated five-person sample roster."],
    ["/privacy", "Privacy — Presence Bridge", "Read what Presence Bridge stores on your device"],
    ["/terms", "Terms — Presence Bridge", "Read the consent, usage, license, and warranty terms"],
    ["/download", "Download — Presence Bridge", "Download Presence Bridge for macOS, Windows, or Linux"]
  ] as const;
  await page.goto("/");
  for (const [path, title, description] of metadata) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://presence-bridge.sociobot.in${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", new RegExp(description));
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", new RegExp(description));
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title);
  }

  await page.goto("/");
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
});

test("the real roster route has complete metadata and legal navigation", async ({ page }) => {
  await page.goto("/app.html");
  await expect(page).toHaveTitle("Presence Bridge — Your local team roster");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://presence-bridge.sociobot.in/app.html");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Presence Bridge — Your local team roster");
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", /saved contact tool/);
  await expect(page.locator(".app-wordmark")).toHaveAttribute("href", "/");
  await expect(page.getByRole("navigation", { name: "App navigation" }).getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("navigation", { name: "App footer navigation" }).getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
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

  // Chromium may abort one navigation while a newly activated worker takes control.
  // Retrying from the stable demo URL verifies the same post-update document path.
  try { await page.reload(); } catch { await page.goto("/demo"); }
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

test("Escape returns dialog focus to the control that opened it", async ({ page }) => {
  await page.goto("/demo");
  const add = page.getByRole("button", { name: "Add person" });
  await add.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(add).toBeFocused();

  const settings = page.getByRole("button", { name: "Settings" });
  await settings.click();
  await page.keyboard.press("Escape");
  await expect(settings).toBeFocused();
});

test("invalid contact links preserve the add-person form and expose an inline recovery path", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Add person" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Quinn Test");
  await page.getByLabel("Role").fill("Support");
  await page.getByLabel("Status note").fill("Ready now");
  await page.getByLabel("Contact tool name").fill("Support chat");
  const contactLink = page.getByLabel("Contact tool link", { exact: true });
  await contactLink.fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Save person" }).click();

  const dialog = page.getByRole("dialog");
  const error = page.locator("#contact-link-error");
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Quinn Test");
  await expect(page.getByLabel("Role")).toHaveValue("Support");
  await expect(page.getByLabel("Status note")).toHaveValue("Ready now");
  await expect(page.getByLabel("Contact tool name")).toHaveValue("Support chat");
  await expect(contactLink).toHaveValue("javascript:alert(1)");
  await expect(error).toHaveText("That contact tool link is not supported. Use a mailto, https, Slack, Teams, Zoom, or phone link.");
  await expect(error).toBeVisible();
  await expect(page.locator(".toast")).toBeEmpty();
  await expect(contactLink).toHaveAttribute("aria-invalid", "true");
  await expect(contactLink).toHaveAttribute("aria-describedby", /\bcontact-link-error\b/);
  await expect(contactLink).toBeFocused();

  const geometry = await error.evaluate(element => {
    const errorBox = element.getBoundingClientRect();
    const dialogBox = element.closest("dialog")!.getBoundingClientRect();
    const centre = document.elementFromPoint(errorBox.x + errorBox.width / 2, errorBox.y + errorBox.height / 2);
    return {
      insideDialog: errorBox.top >= dialogBox.top && errorBox.bottom <= dialogBox.bottom,
      insideViewport: errorBox.top >= 0 && errorBox.bottom <= innerHeight,
      topElementIsError: centre === element || element.contains(centre)
    };
  });
  expect(geometry).toEqual({ insideDialog: true, insideViewport: true, topElementIsError: true });
  const accessibility = await new AxeBuilder({ page: page as never }).include("dialog").analyze();
  expect(accessibility.violations.filter(item => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);

  await contactLink.fill("https://chat.example.com/quinn");
  await page.getByRole("button", { name: "Save person" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("option", { name: /Quinn Test/ })).toContainText("Support");
  await expect(page.getByRole("region", { name: "Selected teammate" })).toContainText("Ready now");
  await expect(page.getByRole("button", { name: /Support chat/ })).toBeVisible();
});

async function expectEveryVisibleTargetToBeAtLeast44px(page: import("@playwright/test").Page, surface: string) {
  const targets = page.locator('a[href], button, input:not([type="hidden"]):not([type="file"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), .file-label');
  const count = await targets.count();
  for (let index = 0; index < count; index += 1) {
    const target = targets.nth(index);
    if (!await target.isVisible()) continue;
    const box = await target.boundingBox();
    const identity = await target.evaluate(element => ({
      tag: element.tagName.toLowerCase(),
      text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
      name: element.getAttribute("aria-label") || element.getAttribute("name") || ""
    }));
    expect(box?.width || 0, `${surface}: ${JSON.stringify(identity)} width`).toBeGreaterThanOrEqual(44);
    expect(box?.height || 0, `${surface}: ${JSON.stringify(identity)} height`).toBeGreaterThanOrEqual(44);
  }
}

test("390px routes, dynamic release links, dialogs, and app footer keep 44px targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.route("https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases?per_page=1", route => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify([{ tag_name: "v0.1.14", assets: [
      { name: "Presence.Bridge_0.1.14_amd64.AppImage", size: 1_200, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.14/Presence.Bridge_0.1.14_amd64.AppImage" },
      { name: "Presence.Bridge_0.1.14_x64-setup.exe", size: 1_200, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.14/Presence.Bridge_0.1.14_x64-setup.exe" },
      { name: "SHA256SUMS", size: 900, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.14/SHA256SUMS" },
      { name: "latest.json", size: 800, browser_download_url: "https://github.com/B-Divyesh/sf-presence-bridge/releases/download/v0.1.14/latest.json" }
    ] }])
  }));

  for (const path of ["/", "/privacy", "/terms", "/download", "/app.html"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if (path === "/download") await page.getByRole("link", { name: "Check SHA256SUMS" }).waitFor();
    await expectEveryVisibleTargetToBeAtLeast44px(page, path);
  }

  await page.goto("/demo");
  await expectEveryVisibleTargetToBeAtLeast44px(page, "/demo");
  await page.getByRole("button", { name: "Settings" }).click();
  await expectEveryVisibleTargetToBeAtLeast44px(page, "/demo settings dialog");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Add person" }).click();
  await expectEveryVisibleTargetToBeAtLeast44px(page, "/demo add-person dialog");
});

test("390px first screen keeps Privacy and all three facts visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Privacy" })).toBeVisible();
  const facts = page.locator(".plain-facts li");
  await expect(facts).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    const box = await facts.nth(index).boundingBox();
    expect(box && box.y + box.height, `fact ${index + 1} must fit in the initial viewport`).toBeLessThanOrEqual(844);
  }
});

test("200 percent text size keeps every site route within the viewport", async ({ page }) => {
  for (const path of ["/", "/demo", "/privacy", "/terms", "/download"]) {
    await page.goto(path);
    // Set the rendered root size directly rather than injecting a style tag.
    // Production CSP correctly rejects injected inline <style> elements.
    await page.evaluate(() => document.documentElement.style.setProperty("font-size", "200%", "important"));
    const widths = await page.evaluate(() => ({
      widths: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
      overflow: [...document.querySelectorAll<HTMLElement>("*")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 8).map(element => `${element.tagName}.${element.className}`)
    }));
    expect(widths.overflow.join(", "), path).toBe("");
  }
});
