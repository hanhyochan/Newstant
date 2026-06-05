const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getApiBaseUrl() {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}
