import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");

describe("release repair contracts", () => {
  it("runs the checksum-verified Windows setup and launches the installed app", () => {
    const script = readFileSync(resolve(root, "public/install.ps1"), "utf8");
    const workflow = readFileSync(resolve(root, ".github/workflows/release.yml"), "utf8");
    expect(script).toContain("$asset.name");
    expect(script).toContain("Start-Process -FilePath $installer");
    expect(script).toContain("-ArgumentList \"/S\"");
    expect(script).toContain("$installedApp");
    expect(script).toContain("Start-Process -FilePath $installedApp");
    expect(script.indexOf("Checksum failed")).toBeLessThan(script.indexOf("Start-Process -FilePath $installer"));
    expect(workflow).toContain("windows-installer-smoke:");
    expect(workflow).toContain("run: ./public/install.ps1");
  });

  it("maps known SPA routes and rewrites host 404 responses with status intact", () => {
    const config = JSON.parse(readFileSync(resolve(root, "public/staticwebapp.config.json"), "utf8"));
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.["404"]).toEqual({ rewrite: "/404.html" });
    for (const route of ["/demo", "/privacy", "/terms", "/download"]) {
      expect(config.routes).toContainEqual(expect.objectContaining({ route, rewrite: "/index.html" }));
    }
  });
});
