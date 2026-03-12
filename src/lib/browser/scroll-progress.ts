export function getPageScrollProgress(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  const documentElement = document.documentElement;
  const scrollTop = window.scrollY || documentElement.scrollTop || 0;
  const scrollableHeight = documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) {
    return 0;
  }

  return scrollTop / scrollableHeight;
}
