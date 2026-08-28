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
    expect(errors).toEqual([]);
  });
}

test("keyboard search and roster navigation", async ({ page }) => {
  await page.goto("/demo");
  await page.keyboard.press("/");
  await expect(page.locator("#roster-search")).toBeFocused();
  await page.locator(".people").focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".person-row.selected")).toContainText("Leo Martin");
});
