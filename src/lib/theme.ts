export const THEME_STORAGE_KEY = "theme";
export const THEME_MANUAL_KEY = "theme_manual_override";
export const THEME_CHANGE_EVENT = "luolei-theme-change";

const LIGHT_THEME_COLOR = "#ffffff";
const DARK_THEME_COLOR = "#1e1e20";

export type ThemeMode = "dark" | "light";

export function readStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : null;
}

export function isManualThemeOverrideEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(THEME_MANUAL_KEY) === "1";
}

export function readSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolvePreferredTheme(): ThemeMode {
  if (!isManualThemeOverrideEnabled()) {
    return readSystemTheme();
  }

  return readStoredTheme() ?? readSystemTheme();
}

export function readThemeFromDom(): ThemeMode {
  if (typeof document === "undefined") return "light";

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function applyTheme(theme: ThemeMode, persist: boolean) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(THEME_MANUAL_KEY, "1");
  }
}

export function emitThemeChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
}

export function toggleThemePreference(): ThemeMode {
  const nextTheme: ThemeMode = readThemeFromDom() === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
  emitThemeChange();
  return nextTheme;
}

export function getThemeColor(theme: ThemeMode): string {
  return theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
}

export function getThemeBootstrapScript(): string {
  return `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var m=localStorage.getItem('${THEME_MANUAL_KEY}')==='1';var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var n=(m&&(t==='dark'||t==='light'))?t:(p?'dark':'light');document.documentElement.classList.toggle('dark',n==='dark')}catch(e){}})()`;
}
