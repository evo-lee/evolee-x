interface StylesheetOptions {
  href: string;
  id: string;
}

interface ScriptOptions {
  async?: boolean;
  defer?: boolean;
  id: string;
  parent?: "body" | "head";
  src: string;
}

const LOAD_STATUS_DATASET_KEY = "loadStatus";

function getScriptLoadStatus(script: HTMLScriptElement): string | undefined {
  return script.dataset[LOAD_STATUS_DATASET_KEY];
}

function setScriptLoadStatus(script: HTMLScriptElement, status: string) {
  script.dataset[LOAD_STATUS_DATASET_KEY] = status;
}

function waitForScriptLoad(
  script: HTMLScriptElement,
  src: string,
): Promise<HTMLScriptElement> {
  const status = getScriptLoadStatus(script);

  if (status === "loaded") {
    return Promise.resolve(script);
  }

  if (status === "error") {
    return Promise.reject(new Error(`Failed to load script: ${src}`));
  }

  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      setScriptLoadStatus(script, "loaded");
      cleanup();
      resolve(script);
    };

    const handleError = () => {
      setScriptLoadStatus(script, "error");
      cleanup();
      reject(new Error(`Failed to load script: ${src}`));
    };

    const cleanup = () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
  });
}

export function ensureStylesheet({
  href,
  id,
}: StylesheetOptions): HTMLLinkElement {
  const existingStylesheet = document.getElementById(id) as HTMLLinkElement | null;
  if (existingStylesheet) {
    return existingStylesheet;
  }

  const stylesheet = document.createElement("link");
  stylesheet.id = id;
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
  return stylesheet;
}

export function ensureScript({
  async = true,
  defer = true,
  id,
  parent = "body",
  src,
}: ScriptOptions): Promise<HTMLScriptElement> {
  const existingScript = document.getElementById(id) as HTMLScriptElement | null;

  if (existingScript) {
    const status = getScriptLoadStatus(existingScript);
    if (!status) {
      setScriptLoadStatus(existingScript, "loaded");
      return Promise.resolve(existingScript);
    }

    return waitForScriptLoad(existingScript, src);
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = async;
  script.defer = defer;
  setScriptLoadStatus(script, "loading");

  const loadPromise = waitForScriptLoad(script, src);
  const parentElement = parent === "head" ? document.head : document.body;
  parentElement.appendChild(script);
  return loadPromise;
}
