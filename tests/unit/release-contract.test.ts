import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readProductVersions, verifyReleaseProvenance } from "../../scripts/verify-release-provenance.mjs";

const root = resolve(import.meta.dirname, "../..");

describe("release repair contracts", () => {
  it("keeps every package version aligned and rejects a release from a stale commit", () => {
    const versions = readProductVersions(root);
    expect(new Set(Object.values(versions))).toEqual(new Set(["0.1.17"]));

    const expectedCommit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const matchingRelease = { tag_name: "v0.1.17", target_commitish: expectedCommit };
    expect(verifyReleaseProvenance({
      release: matchingRelease,
      expectedCommit,
      expectedTag: "v0.1.17",
      versions
    })).toEqual({ version: "0.1.17", tag: "v0.1.17", sourceCommit: expectedCommit });

    expect(() => verifyReleaseProvenance({
      release: { ...matchingRelease, target_commitish: "166e4d6b6690157e154c22e0e2359116ae7734e1" },
      expectedCommit,
      expectedTag: "v0.1.17",
      versions
    })).toThrow("Published release targets 166e4d6b6690157e154c22e0e2359116ae7734e1; expected aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.");
  });

  it("runs the same provenance CLI used by the release job from the repository checkout", () => {
    const output = execFileSync(process.execPath, [
      resolve(root, "scripts/verify-release-provenance.mjs"),
      resolve(root, "tests/fixtures/release-v0.1.17.json"),
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "v0.1.17"
    ], { encoding: "utf8" });
    expect(output).toBe("Verified v0.1.17 targets aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.\n");
  });

  it("records and verifies release source provenance in the publishing workflow", () => {
    const workflow = readFileSync(resolve(root, ".github/workflows/release.yml"), "utf8");
    expect(workflow).toContain("verify-release-provenance.mjs release.json");
    expect(workflow).toContain("\"${GITHUB_SHA}\" \"${GITHUB_REF_NAME}\"");
    expect(workflow).toContain('"source_commit": os.environ[\'GITHUB_SHA\']');
    expect(workflow).toContain("GITHUB_TOKEN: ${{ github.token }}");
  });

  it("allows every advertised protocol through the native opener and exercises the packaged command", () => {
    const capability = JSON.parse(readFileSync(resolve(root, "src-tauri/capabilities/default.json"), "utf8"));
    const customScope = capability.permissions.find((permission: unknown) =>
      typeof permission === "object" && permission !== null && (permission as { identifier?: string }).identifier === "opener:allow-open-url"
    );
    expect(customScope).toEqual({
      identifier: "opener:allow-open-url",
      allow: [{ url: "slack:*" }, { url: "msteams:*" }, { url: "zoommtg:*" }]
    });

    const nativeSource = readFileSync(resolve(root, "src-tauri/src/lib.rs"), "utf8");
    const workflow = readFileSync(resolve(root, ".github/workflows/release.yml"), "utf8");
    for (const protocol of ["slack://", "msteams://", "https://", "mailto:", "zoommtg://", "tel:"]) {
      expect(nativeSource).toContain(protocol);
      expect(workflow).toContain(protocol);
    }
    expect(nativeSource).toContain('invoke("plugin:opener|open_url", { url })');
    expect(workflow).toContain('presence-bridge" --smoke-opener');
    expect(workflow).toContain('grep -Fqx "native opener accepted $url"');
  });

  it("runs the checksum-verified Windows setup and launches the installed app", () => {
    const script = readFileSync(resolve(root, "public/install.ps1"), "utf8");
    const workflow = readFileSync(resolve(root, ".github/workflows/release.yml"), "utf8");
    expect(script).toContain("$asset.name");
    expect(script).toContain("$headers.Authorization");
    expect(script).toContain("Invoke-RestMethod -Headers $headers");
    expect(script).toContain("Start-Process -FilePath $installer");
    expect(script).toContain("-ArgumentList \"/S\"");
    expect(script).toContain("$installedApp");
    expect(script).toContain('"presence-bridge.exe"');
    expect(script).toContain("Windows\\CurrentVersion\\Uninstall");
    expect(script).toContain(".Trim([char]34)");
    expect(script).toContain("$_.DisplayIcon");
    expect(script).toContain("Start-Process -FilePath $installedApp");
    expect(script.indexOf("Checksum failed")).toBeLessThan(script.indexOf("Start-Process -FilePath $installer"));
    expect(workflow).toContain("windows-installer-smoke:");
    expect(workflow).toContain("run: ./public/install.ps1");
  });

  it("reads the Linux release response as JSON before verifying and installing the AppImage", () => {
    const script = readFileSync(resolve(root, "public/install.sh"), "utf8");
    const workflow = readFileSync(resolve(root, ".github/workflows/release.yml"), "utf8");
    expect(script).toContain("python3");
    expect(script).toContain("json.load");
    expect(script).toContain(".AppImage");
    expect(script).toContain("SHA256SUMS");
    expect(script).toContain("sha256sum");
    expect(script).not.toContain('browser_download_url": "');
    expect(workflow).toContain("linux-installer-smoke:");
    expect(workflow).toContain('"$XDG_BIN_HOME/presence-bridge" --appimage-version');
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
