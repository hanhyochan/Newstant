const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const isLocalhostApi =
  configuredApiBaseUrl !== undefined &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/.test(configuredApiBaseUrl);
const apiBaseUrl =
  configuredApiBaseUrl && !(process.env.NODE_ENV === "production" && isLocalhostApi)
    ? configuredApiBaseUrl
    : "/api/mock";

export function getApiBaseUrl() {
  return apiBaseUrl.replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}
