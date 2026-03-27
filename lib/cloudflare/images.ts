import { siteConfig } from '@/lib/site';

export const VARIANT_CATALOG = {
  'thumb-sm': {
    width: 320,
    height: 180,
    aspectRatio: '16 / 9',
  },
  'thumb-md': {
    width: 640,
    height: 360,
    aspectRatio: '16 / 9',
  },
  'cover-md': {
    width: 1200,
    height: 600,
    aspectRatio: '2 / 1',
  },
  'cover-lg': {
    width: 1600,
    height: 800,
    aspectRatio: '2 / 1',
  },
  'og-cover': {
    width: 1200,
    height: 630,
    aspectRatio: '1200 / 630',
  },
} as const;

export type ImageVariant = keyof typeof VARIANT_CATALOG;

const DEFAULT_IMAGE_PATH = '/images/default-cover.svg';

function normalizeSource(src?: string): string {
  if (!src || src.startsWith('data:')) {
    return DEFAULT_IMAGE_PATH;
  }

  return src;
}

export function encodeImageToken(src: string): string {
  return Buffer.from(normalizeSource(src)).toString('base64url');
}

export function decodeImageToken(token: string): string {
  return Buffer.from(token, 'base64url').toString('utf8');
}

export function getImageUrl(
  src: string | undefined,
  variant: ImageVariant,
  options?: { absolute?: boolean }
): string {
  const token = encodeImageToken(normalizeSource(src));
  const pathname = `/image/${variant}/${token}`;

  return options?.absolute ? `${siteConfig.baseUrl}${pathname}` : pathname;
}

export function getVariantConfig(variant: ImageVariant) {
  return VARIANT_CATALOG[variant];
}

export function getThumbVariant(width: number): ImageVariant {
  return width <= VARIANT_CATALOG['thumb-sm'].width ? 'thumb-sm' : 'thumb-md';
}

export function getCoverVariant(width: number): ImageVariant {
  return width <= VARIANT_CATALOG['cover-md'].width ? 'cover-md' : 'cover-lg';
}

