import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function readProductVersions(root) {
  const readJson = path => JSON.parse(readFileSync(resolve(root, path), "utf8"));
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  const tauri = readJson("src-tauri/tauri.conf.json");
  const cargo = readFileSync(resolve(root, "src-tauri/Cargo.toml"), "utf8");
  const cargoVersion = cargo.match(/^version = "([^"]+)"$/m)?.[1];
  return {
    package: packageJson.version,
    packageLock: packageLock.version,
    packageLockRoot: packageLock.packages?.[""]?.version,
    tauri: tauri.version,
    cargo: cargoVersion
  };
}

export function verifyReleaseProvenance({ release, expectedCommit, expectedTag, versions }) {
  const uniqueVersions = new Set(Object.values(versions));
  if (uniqueVersions.size !== 1 || uniqueVersions.has(undefined)) {
    throw new Error(`Product versions do not match: ${JSON.stringify(versions)}`);
  }
  const version = versions.package;
  if (expectedTag !== `v${version}`) {
    throw new Error(`Release tag ${expectedTag} does not match product version ${version}.`);
  }
  if (release.tag_name !== expectedTag) {
    throw new Error(`Published tag ${release.tag_name} does not match ${expectedTag}.`);
  }
  if (release.target_commitish !== expectedCommit) {
    throw new Error(`Published release targets ${release.target_commitish}; expected ${expectedCommit}.`);
  }
  return { version, tag: expectedTag, sourceCommit: expectedCommit };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const [releasePath, expectedCommit, expectedTag] = process.argv.slice(2);
  if (!releasePath || !expectedCommit || !expectedTag) {
    throw new Error("Usage: node scripts/verify-release-provenance.mjs <release.json> <commit> <tag>");
  }
  const root = fileURLToPath(new URL("..", import.meta.url));
  const release = JSON.parse(readFileSync(resolve(releasePath), "utf8"));
  const result = verifyReleaseProvenance({ release, expectedCommit, expectedTag, versions: readProductVersions(root) });
  process.stdout.write(`Verified ${result.tag} targets ${result.sourceCommit}.\n`);
}
