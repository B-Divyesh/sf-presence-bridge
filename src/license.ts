const TOKEN_KEY = "sb_license:presence-bridge";
const VERDICT_KEY = "presence-bridge:license-verdict";
const DAY = 86_400_000;

export type LicenseState = { valid: boolean; checkedAt: number; reason?: string };

export const checkoutUrl = "https://api.sociobot.in/api/v1/products/presence-bridge/checkout";

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get("license");
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export function cachedLicense(): LicenseState {
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) || "null") as LicenseState | null;
    return verdict?.valid ? verdict : { valid: false, checkedAt: 0, reason: verdict?.reason };
  } catch { return { valid: false, checkedAt: 0 }; }
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(TOKEN_KEY);
  const cached = cachedLicense();
  if (!token) return { valid: false, checkedAt: 0 };
  if (!force && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/presence-bridge/verify?license=${encodeURIComponent(token)}`);
    const body = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: body.valid, reason: body.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return cached;
  }
}

export async function restoreLicense(token: string): Promise<LicenseState> {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
  return verifyLicense(true);
}
