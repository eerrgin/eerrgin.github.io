import type { LocationRewrite } from "@tanstack/react-router";

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | boolean | undefined>;
};

function configuredPathBasedPreviewHosts(): Set<string> {
  const raw = (import.meta as ImportMetaWithEnv).env?.VITE_ATOLYE_PREVIEW_PATH_HOSTS;
  return new Set(
    String(raw ?? "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

const PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;

/**
 * Rewrites the development server path only for explicitly configured hosts.
 * No provider-specific hostnames are embedded in the source.
 */
export function previewPathPrefix(
  hostname: string,
  pathname: string,
  allowedHosts: ReadonlySet<string> = configuredPathBasedPreviewHosts(),
): string | undefined {
  if (!allowedHosts.has(hostname.toLowerCase())) return undefined;
  return PORT_ID_PREFIX.exec(pathname)?.[0];
}

export function prefixRewrite(prefix: string): LocationRewrite {
  return {
    input: ({ url }) => {
      if (url.pathname === prefix) url.pathname = "/";
      else if (url.pathname.startsWith(`${prefix}/`))
        url.pathname = url.pathname.slice(prefix.length);
      return url;
    },
    output: ({ url }) => {
      url.pathname = `${prefix}${url.pathname}`;
      return url;
    },
  };
}

export function previewPathRewrite(): LocationRewrite | undefined {
  if (typeof window === "undefined") return undefined;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return prefix ? prefixRewrite(prefix) : undefined;
}
