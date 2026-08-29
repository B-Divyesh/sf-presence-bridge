import type { Page } from "@playwright/test";

export function wordCount(value: string): number;
export function collectLanding(page: Page): Promise<string[]>;
export function collectReadme(root?: string): Promise<string[]>;
export function formatAudit(landing: string[], readme: string[]): string;
export function generatedAudit(page: Page, root?: string): Promise<string>;
