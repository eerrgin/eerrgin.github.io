type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | boolean | undefined>;
};

function configuredPreviewHosts(): string[] {
  const raw = (import.meta as ImportMetaWithEnv).env?.VITE_ATOLYE_PREVIEW_HOSTS;
  return String(raw ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1);
    return host.endsWith(suffix) && host !== suffix.slice(1);
  }
  return host === pattern;
}

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

/** Only explicitly configured preview hosts and local development are accepted. */
export function isAtolyeEmbedderOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (isLoopbackHost(host)) return true;
    return configuredPreviewHosts().some((pattern) => hostMatches(host, pattern));
  } catch {
    return false;
  }
}

/** Whether this hostname is one of the configured isolated preview hosts. */
export function isAtolyePreviewGuestHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return configuredPreviewHosts().some((pattern) => hostMatches(host, pattern));
}

export function resolveParentEmbedderOrigin(
  parentIsSelf: boolean,
  referrer: string,
  ancestorOrigin?: string | null,
  _guestHostname: string = "",
): string | null {
  if (parentIsSelf) return null;
  for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) {
    try {
      const url = new URL(
        candidate.includes("://") ? candidate : `https://${candidate}`,
      );
      if (isAtolyeEmbedderOrigin(url.origin)) return url.origin;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}
