type UmamiWindow = Window & {
  umami?: {
    track?: (name: string, params?: Record<string, unknown>) => void;
  };
};

type GAWindow = Window & {
  gtag?: (command: string, name: string, params?: Record<string, unknown>) => void;
};

export function hasUmami(): boolean {
  return typeof window !== 'undefined' && typeof (window as UmamiWindow).umami?.track === 'function';
}

export function hasGA4(): boolean {
  return typeof window !== 'undefined' && typeof (window as GAWindow).gtag === 'function';
}
