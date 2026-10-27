/**
 * Optional external sign-in broker configuration for the Ergin Teknik Atölye
 * workspace. No preview credentials or provider endpoint are bundled in source.
 * Configure these values explicitly in the deployment environment to enable
 * an OAuth broker. Without configuration, federated sign-in remains disabled.
 */
const env = (key: string): string => process.env[key]?.trim() ?? "";

export const PREVIEW_CLIENT_ID = env("ATOLYE_PREVIEW_CLIENT_ID");
export const PREVIEW_CLIENT_SECRET = env("ATOLYE_PREVIEW_CLIENT_SECRET");

/** Optional auth broker issuer, supplied by the deployment environment. */
export const ATOLYE_ISSUER_DEFAULT = env("ATOLYE_AUTH_ISSUER");

/**
 * Comma-separated preview host patterns accepted for dynamic callback URLs.
 * Empty by default: only explicitly configured preview hosts are trusted.
 */
export const PREVIEW_ALLOWED_HOSTS = env("ATOLYE_PREVIEW_ALLOWED_HOSTS")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);
