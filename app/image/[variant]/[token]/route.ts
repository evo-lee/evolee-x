import { NextResponse } from 'next/server';
import { decodeImageToken, getVariantConfig, VARIANT_CATALOG, type ImageVariant } from '@/lib/cloudflare/images';

function isVariant(value: string): value is ImageVariant {
  return value in VARIANT_CATALOG;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ variant: string; token: string }> }
) {
  const { variant, token } = await params;

  if (!isVariant(variant)) {
    return new NextResponse('Unknown image variant', { status: 404 });
  }

  const src = decodeImageToken(token);
  const target = src.startsWith('http://') || src.startsWith('https://') ? src : new URL(src, request.url).toString();
  const upstream = await fetch(target);

  if (!upstream.ok) {
    return new NextResponse('Image source unavailable', { status: 404 });
  }

  const config = getVariantConfig(variant);
  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Image-Variant', variant);
  headers.set('X-Image-Width', String(config.width));
  headers.set('X-Image-Height', String(config.height));

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}

