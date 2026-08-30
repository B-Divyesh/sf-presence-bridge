export type ProductVersions = {
  package: string | undefined;
  packageLock: string | undefined;
  packageLockRoot: string | undefined;
  tauri: string | undefined;
  cargo: string | undefined;
};

export type ReleaseIdentity = {
  tag_name?: string;
  target_commitish?: string;
};

export function readProductVersions(root: string): ProductVersions;

export function verifyCandidateCommit(input: {
  root: string;
  candidate: string;
}): string;

export function verifyReleaseProvenance(input: {
  release: ReleaseIdentity;
  expectedCommit: string;
  expectedTag: string;
  versions: ProductVersions;
}): { version: string; tag: string; sourceCommit: string };
