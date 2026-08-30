import { execFileSync } from "node:child_process";
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

/**
 * Release tags must name an actual commit in the checkout.  Checking this
 * before any package work starts keeps a typo in a work order or tag from
 * producing a release whose provenance cannot later be verified.
 */
export function verifyCandidateCommit({ root, candidate }) {
  if (!/^[0-9a-f]{40}$/i.test(candidate)) {
    throw new Error(`Candidate ${candidate} must be a full 40-character commit SHA.`);
  }
  try {
    const resolved = execFileSync("git", ["rev-parse", "--verify", `${candidate}^{commit}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    if (resolved.toLowerCase() !== candidate.toLowerCase()) {
      throw new Error(`Candidate ${candidate} resolved to ${resolved}, not the requested commit.`);
    }
    return resolved;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Candidate ")) throw error;
    throw new Error(`Candidate ${candidate} is unavailable in this checkout.`);
  }
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
  const [firstArgument, secondArgument, thirdArgument] = process.argv.slice(2);
  const root = fileURLToPath(new URL("..", import.meta.url));
  if (firstArgument === "--candidate") {
    if (!secondArgument) throw new Error("Usage: node scripts/verify-release-provenance.mjs --candidate <commit>");
    const candidate = verifyCandidateCommit({ root, candidate: secondArgument });
    process.stdout.write(`Verified candidate ${candidate} is reachable.\n`);
    process.exit(0);
  }
  const [releasePath, expectedCommit, expectedTag] = [firstArgument, secondArgument, thirdArgument];
  if (!releasePath || !expectedCommit || !expectedTag) {
    throw new Error("Usage: node scripts/verify-release-provenance.mjs <release.json> <commit> <tag>");
  }
  const release = JSON.parse(readFileSync(resolve(releasePath), "utf8"));
  const result = verifyReleaseProvenance({ release, expectedCommit, expectedTag, versions: readProductVersions(root) });
  process.stdout.write(`Verified ${result.tag} targets ${result.sourceCommit}.\n`);
}
