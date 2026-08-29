import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { generatedAudit, wordCount } from "../../scripts/copy-audit.mjs";

test("the committed copy audit matches rendered copy and README", async ({ page }) => {
  const generated = await generatedAudit(page);
  const committed = await readFile(".factory/copy-audit.md", "utf8");
  expect(committed).toBe(generated);
  const entries = [...generated.matchAll(/^\| ([^|]+) \| (\d+) \|$/gm)];
  for (const [, value, count] of entries) expect(Number(count)).toBe(wordCount(value.replaceAll("\\|", "|")));
  expect(generated).toContain("PASS — no entry exceeds 22 words");
});

