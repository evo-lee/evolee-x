export function getExternalLinkUrl(link: HTMLAnchorElement): URL | null {
  const href = link.getAttribute("href");
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (url.origin === window.location.origin) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function ensureExternalLinkAttributes(
  link: HTMLAnchorElement,
  externalUrl: URL,
) {
  link.setAttribute("target", "_blank");

  const relSet = new Set(
    (link.getAttribute("rel") ?? "")
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

  relSet.add("noopener");
  relSet.add("noreferrer");

  link.setAttribute("rel", Array.from(relSet).join(" "));
  link.dataset.externalLink = "true";
  link.dataset.externalDomain = externalUrl.hostname.toLowerCase();
}
