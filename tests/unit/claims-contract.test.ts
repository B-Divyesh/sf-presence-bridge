import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Claim = { id: string; claim: string; where: string; test: string; sandbox: string };
const root = resolve(import.meta.dirname, "../..");

describe("claims registry", () => {
  it("maps every unique claim id to exactly one tagged test", () => {
    const claims = JSON.parse(readFileSync(resolve(root, ".factory/claims.json"), "utf8")) as Claim[];
    const tests = readFileSync(resolve(root, "tests/e2e/claims.spec.ts"), "utf8");
    expect(claims.length).toBeGreaterThanOrEqual(24);
    expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim.trim(), claim.id).not.toBe("");
      expect(claim.where.trim(), claim.id).not.toBe("");
      expect(claim.sandbox.trim(), claim.id).not.toBe("");
      expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
      const occurrences = tests.match(new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")) || [];
      expect(occurrences, claim.id).toHaveLength(1);
    }
    const tags = [...tests.matchAll(/@claim:([a-z0-9-]+)/g)].map(match => match[1]);
    expect(tags.sort()).toEqual(claims.map(claim => claim.id).sort());
  });
});
