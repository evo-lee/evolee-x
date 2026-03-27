import type { ImageLoaderProps } from 'next/image';
import { getCoverVariant, getImageUrl, getThumbVariant, type ImageVariant } from './images';

function inferVariant(width: number): ImageVariant {
  if (width <= 640) {
    return getThumbVariant(width);
  }

  return getCoverVariant(width);
}

export default function cloudflareImageLoader({ src, width }: ImageLoaderProps): string {
  return getImageUrl(src, inferVariant(width));
}

export function articleImageLoader({ src, width }: ImageLoaderProps): string {
  return getImageUrl(src, getThumbVariant(width));
}

export function coverImageLoader({ src, width }: ImageLoaderProps): string {
  return getImageUrl(src, getCoverVariant(width));
}

