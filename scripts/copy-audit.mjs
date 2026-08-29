import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const banned = ["leverage", "seamless", "effortless", "robust", "powerful", "intuitive", "reimagine", "supercharge", "delightful", "journey", "ecosystem", "ai-powered"];

const clean = value => value
  .replace(/\[([^\]]+)]\([^\)]+\)/g, "$1")
  .replace(/[`*_#]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const sentences = value => {
  const normalized = clean(value);
  if (!normalized) return [];
  return normalized.split(/(?<=[.!?])\s+(?=[A-Z`])/)
    .map(part => clean(part))
    .filter(Boolean);
};

export const wordCount = value => clean(value).split(/\s+/).filter(Boolean).length;

export async function collectLanding(page) {
  await page.goto(new URL("/", process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173").toString());
  await page.locator("#home-preview .person-row").first().waitFor();
  const values = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
    };
    const copy = [...document.querySelectorAll("main h1, main h2, main h3, main p, main li, main button, main a, main label, main input[placeholder], .hero-action > span, .roster-heading > span, footer p, footer a")]
      .filter(visible)
      .map(element => element instanceof HTMLInputElement ? element.placeholder : element.textContent || "");
    const alt = [...document.querySelectorAll("main img[alt]")].map(image => image.getAttribute("alt") || "");
    const names = [...document.querySelectorAll("main [aria-label]")].filter(visible).map(element => element.getAttribute("aria-label") || "");
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    return [document.title, description, ...copy, ...alt, ...names];
  });
  const output = [];
  const seen = new Set();
  for (const value of values.flatMap(sentences)) {
    if (!seen.has(value)) { seen.add(value); output.push(value); }
  }
  return output;
}

export async function collectReadme(root = process.cwd()) {
  const markdown = await readFile(resolve(root, "README.md"), "utf8");
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "");
  const blocks = withoutCode.split(/\n\s*\n/).flatMap(block => {
    const lines = block.split("\n").map(line => line.replace(/^\s*(?:#{1,6}|[-*])\s+/, "").trim()).filter(Boolean);
    return lines.length > 1 && block.trimStart().startsWith("-") ? lines : [lines.join(" ")];
  });
  return blocks.flatMap(sentences);
}

function table(entries) {
  return entries.map(value => `| ${value.replaceAll("|", "\\|")} | ${wordCount(value)} |`).join("\n");
}

export function formatAudit(landing, readme) {
  const all = [...landing, ...readme];
  const flagged = all.filter(value => wordCount(value) > 22 || banned.some(term => value.toLowerCase().includes(term)));
  return `# Copy audit

Generated from the rendered landing page and README with \`scripts/copy-audit.mjs\`. Words are whitespace-separated after Markdown and repeated spaces are removed. The browser test fails if this file differs from generated output.

Result: ${flagged.length ? `**FAIL — ${flagged.length} flagged entries.**` : "**PASS — no entry exceeds 22 words and no banned marketing term appears.**"}

## Rendered landing page

This includes visible headings, sentences, actions, labels, placeholders, image alt text, accessible names, the title, and the description.

| Copy | Words |
| --- | ---: |
${table(landing)}

## README

This includes headings, prose, requirements, project-map entries, and license sentences. Fenced command examples are excluded.

| Copy | Words |
| --- | ---: |
${table(readme)}

## Terminology

| Concept | One term used |
| --- | --- |
| The list of people | roster |
| A person's availability | status |
| A saved communication destination | contact tool |
| Imported schedule file | calendar |
| Paid license | Bridge Plus |
| Isolated sample experience | demo |
| Explicitly shared availability file | presence update |
| Opt-in local refresh location | shared folder |
`;
}

export async function generatedAudit(page, root = process.cwd()) {
  return formatAudit(await collectLanding(page), await collectReadme(root));
}
