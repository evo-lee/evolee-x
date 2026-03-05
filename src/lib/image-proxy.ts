const IMAGE_PROXY_HOST = "https://img.is26.com";

function normalizeSource(url: string): string {
  const source = url.trim();
  if (!source) return "";
  if (source.startsWith("//")) {
    return `https:${source}`;
  }
  return source;
}

function stripProxyVariant(url: string): string {
  return url
    .replace(/\?variant=[^&]+/, "")
    .replace(/\/w=[^/?#]+(?:,[^/?#]+)*$/, "")
    .replace(/\?$/, "");
}

export function getProxiedImage(
  url?: string,
  variant = "w=800",
): string {
  if (!url) return "";

  const source = normalizeSource(url);
  if (!source) return "";

  if (source.startsWith("data:") || source.startsWith("blob:")) {
    return source;
  }

  if (source.startsWith("/") && !source.startsWith("//")) {
    return source;
  }

  if (source.startsWith(`${IMAGE_PROXY_HOST}/`)) {
    const clean = stripProxyVariant(source);
    return variant ? `${clean}?variant=${variant}` : clean;
  }

  const raw = source.startsWith("http") ? source : source.replace(/^\/+/, "");
  const proxied = `${IMAGE_PROXY_HOST}/${raw}`;
  return variant ? `${proxied}?variant=${variant}` : proxied;
}
