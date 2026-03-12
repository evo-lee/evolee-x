import { readThemeFromDom } from "@/lib/theme";

export function isDarkThemeActive(): boolean {
  return readThemeFromDom() === "dark";
}

export function observeThemeClass(
  onChange: (isDark: boolean) => void,
): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const documentElement = document.documentElement;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "class") {
        onChange(documentElement.classList.contains("dark"));
      }
    }
  });

  observer.observe(documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}
