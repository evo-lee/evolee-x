const FAVICON_PROXY_BASE_URL = "https://img.is26.com/static.is26.com/favicon";

export function getFaviconUrlForDomain(domain: string): string {
  const normalizedDomain = domain.trim().toLowerCase();
  return `${FAVICON_PROXY_BASE_URL}/${normalizedDomain}`;
}

export function getFaviconUrlForSite(siteUrl: string): string | null {
  if (!siteUrl) return null;

  try {
    return getFaviconUrlForDomain(new URL(siteUrl).hostname);
  } catch {
    return null;
  }
}
