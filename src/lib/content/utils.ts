const CF_IMAGE_PROXY_HOST = "https://img.is26.com";

export function formatDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y} 年 ${m} 月 ${d} 日`;
}

export function formatShowDate(dateInput: string): string {
  const source = new Date(dateInput);
  const now = new Date();

  // Same calendar day → "今天"
  if (
    source.getFullYear() === now.getFullYear() &&
    source.getMonth() === now.getMonth() &&
    source.getDate() === now.getDate()
  ) {
    return "今天";
  }

  return source.toISOString().slice(0, 10);
}

function normalizeImageSource(url: string): string {
  const source = url.trim();
  if (!source) return "";
  if (source.startsWith("//")) {
    return `https:${source}`;
  }
  return source;
}

function stripCfTransform(url: string): string {
  return url.replace(/\/w=[^/?#]+(?:,[^/?#]+)*$/, "");
}

function toCfImage(url: string, transform?: string): string {
  const source = normalizeImageSource(url);
  if (!source) return "";

  if (source.startsWith("data:") || source.startsWith("blob:")) {
    return source;
  }

  if (source.startsWith("/") && !source.startsWith("//")) {
    return source;
  }

  if (source.startsWith(`${CF_IMAGE_PROXY_HOST}/`)) {
    const clean = stripCfTransform(source);
    return transform ? `${clean}/${transform}` : clean;
  }

  const raw = source.startsWith("http") ? source : source.replace(/^\/+/, "");
  const proxied = `${CF_IMAGE_PROXY_HOST}/${raw}`;
  return transform ? `${proxied}/${transform}` : proxied;
}

export function getOriginalImage(url: string): string {
  return toCfImage(url);
}

export function getPreviewImage(url?: string): string {
  if (!url) return "";
  return toCfImage(url, "w=800");
}

export function getArticleLazyImage(url: string): string {
  return toCfImage(url, "w=1200");
}

export function getBannerImage(url?: string): string {
  if (!url) return "";
  return toCfImage(url, "w=800");
}
