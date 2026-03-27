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

/**
 * Encode a source image path into a URL-safe token for the image route.
 *
 * @param src Original relative or absolute image source.
 * @returns Base64url token used in `/image/{variant}/{token}` routes.
 */
export function encodeImageToken(src: string): string {
  return Buffer.from(normalizeSource(src)).toString('base64url');
}

/**
 * Decode a URL-safe image token back into its original source string.
 *
 * @param token Base64url token from an image route.
 * @returns Decoded source path or URL.
 */
export function decodeImageToken(token: string): string {
  return Buffer.from(token, 'base64url').toString('utf8');
}

/**
 * Build a public image delivery URL for a predefined variant.
 *
 * @param src Original source path or URL. Missing or data URLs fall back to the default cover.
 * @param variant Named image variant from the catalog.
 * @param options Optional absolute URL switch for metadata output.
 * @returns Relative or absolute `/image/{variant}/{token}` URL.
 */
export function getImageUrl(
  src: string | undefined,
  variant: ImageVariant,
  options?: { absolute?: boolean }
): string {
  const token = encodeImageToken(normalizeSource(src));
  const pathname = `/image/${variant}/${token}`;

  return options?.absolute ? `${siteConfig.baseUrl}${pathname}` : pathname;
}

/**
 * Look up the width, height, and aspect ratio metadata for a named variant.
 *
 * @param variant Named image variant.
 * @returns Variant configuration object.
 */
export function getVariantConfig(variant: ImageVariant) {
  return VARIANT_CATALOG[variant];
}

/**
 * Choose the thumbnail variant that best matches a requested width bucket.
 *
 * @param width Consumer-requested width.
 * @returns `thumb-sm` for compact widths, otherwise `thumb-md`.
 */
export function getThumbVariant(width: number): ImageVariant {
  return width <= VARIANT_CATALOG['thumb-sm'].width ? 'thumb-sm' : 'thumb-md';
}

/**
 * Choose the cover variant that best matches a requested width bucket.
 *
 * @param width Consumer-requested width.
 * @returns `cover-md` for standard widths, otherwise `cover-lg`.
 */
export function getCoverVariant(width: number): ImageVariant {
  return width <= VARIANT_CATALOG['cover-md'].width ? 'cover-md' : 'cover-lg';
}
